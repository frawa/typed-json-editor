import { languages, editor, json } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api.js";
import { getSuggestPosAt, SuggestPos, toInstance } from "./typedJsonUtil";
import { ASTNode } from "vscode-json-languageservice";
import { basicOutputToMarkers, parseBasicOutput } from "./basicOutput";
import {
  parseSuggestionOutput,
  SuggestionOutput,
  suggestionsToCompletionItems,
} from "./suggestions";

export type GetSuggestionsFun = (
  n: ASTNode,
  pos: SuggestPos,
) => Promise<readonly SuggestionOutput[]>;

export function enableTypedJson(
  model: editor.ITextModel | null,
  getSuggestions: GetSuggestionsFun,
) {
  return languages.registerCompletionItemProvider("json", {
    // triggerCharacters: [' ,:{'],
    // triggerCharacters: [" "],
    triggerCharacters: [], // default is ctrl-space

    provideCompletionItems: async (m, position) => {
      if (model !== m) {
        return null;
      }
      const doc = await parseJSONDocument(m);
      const offset = m.getOffsetAt(position);

      if (doc?.root) {
        const suggestPos = getSuggestPosAt(offset, doc);
        if (suggestPos) {
          const output = await getSuggestions(doc.root, suggestPos);
          const { replaceOffset, replaceLength } = suggestPos;
          const from = m.getPositionAt(replaceOffset);
          const to = m.getPositionAt(replaceOffset + replaceLength);
          const range = Range.fromPositions(from, to);
          if (output.length > 0) {
            const items = suggestionsToCompletionItems(
              output,
              suggestPos,
              range,
            );
            console.log("suggesting", suggestPos, items);
            return Promise.resolve({ suggestions: items });
          }
        }
      }
    },
  });
}

export const updatedInstance = debounced(updatedInstance_);
export const updatedSchema = debounced(updatedSchema_);

function debounced<S, T>(
  f: (a: T) => Promise<S>,
  delayMs = 513,
): (a: T) => Promise<S> {
  let cancelId: number | undefined;
  return (a) => {
    clearTimeout(cancelId);
    return new Promise((resolve) => {
      cancelId = setTimeout(() => f(a).then(resolve), delayMs);
    });
  };
}

async function updatedInstance_(
  e: editor.IStandaloneCodeEditor,
): Promise<void> {
  const model = e.getModel();
  if (model) {
    const json = await getValidation(model.getValue());
    const o =  parseBasicOutput(json);
    const doc = await parseJSONDocument(model);
    const markers = (doc ? basicOutputToMarkers(o, model, doc) : []);
    editor.setModelMarkers(model, "instance validation", markers);
  }
  return Promise.resolve();
}

async function updatedSchema_(e: editor.IStandaloneCodeEditor): Promise<void> {
  const model = e.getModel();
  if (model) {
    await Promise.all([
      putSchema(e.getValue()),
      getSchemaValidation(model.getValue())
        .then(parseBasicOutput)
        .then(async (o) => {
          const doc = await parseJSONDocument(model);
          return doc ? basicOutputToMarkers(o, model, doc) : [];
        })
        .then((markers) => {
          editor.setModelMarkers(model, "instance validation", markers);
        }),
    ]);
  }
  return Promise.resolve();
}

async function parseJSONDocument(m: editor.ITextModel) {
  const worker: json.IJSONWorker = await (await json.getWorker())();
  return await worker.parseJSONDocument(m.uri.toString());
}

export async function getSuggestions(
  node: ASTNode,
  pos: SuggestPos,
): Promise<readonly SuggestionOutput[]> {
  const body = {
    instance: toInstance(node),
    pointer: pos.pointer,
    inside: pos.inside,
  };
  const response = await fetch("api/suggest", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.log("ERROR fetching instance suggestions", response.status);
  }
  const raw = await response.json();
  return parseSuggestionOutput(raw);
}

export async function getSchemaSuggestions(instance: ASTNode, pos: SuggestPos) {
  const body = {
    instance: toInstance(instance),
    pointer: pos.pointer,
    inside: pos.inside,
  };
  const response = await fetch("api/suggestSchema", {
    method: "POST",
    // credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.log("ERROR fetching schema suggestions", response.status);
  }
  return await response.json();
}

export async function getValidation(instance: string) {
  return fetch("api/validate?output=basic", {
    method: "POST",
    credentials: "include",
    body: instance,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR validating instance", response.status);
    }
    return response.json();
  });
}

export async function getSchemaValidation(instance: string) {
  return fetch("api/validateSchema?output=basic", {
    method: "POST",
    // credentials: "include",
    body: instance,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR validating schema", response.status);
    }
    return response.json();
  });
}

export async function putSchema(schema: string) {
  return fetch("api/schema", {
    method: "PUT",
    credentials: "include",
    body: schema,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR putting schema", response.status);
    }
    return response.json();
  });
}
