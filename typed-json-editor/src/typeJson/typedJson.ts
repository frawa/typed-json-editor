import { languages, editor, json } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api";
import { getSuggestPosAt, SuggestPos, toInstance } from "./typedJsonUtil";
import { ASTNode } from "vscode-json-languageservice";
import { basicOutputToMarkers, parseBasicOutput } from "./basicOutput";
import { parseSuggestions, suggestionsToCompletionItems } from "./suggestions";

export function enableTypedJson(model: editor.ITextModel | null) {
  return languages.registerCompletionItemProvider("json", {
    // triggerCharacters: [' ,:{'],
    triggerCharacters: [" "],

    provideCompletionItems: async (m, position, context) => {
      if (model !== m) {
        return null;
      }
      const doc = await parseJSONDocument(m);
      const offset = m.getOffsetAt(position);

      if (doc?.root) {
        const suggestPos = getSuggestPosAt(offset, doc);
        console.log("FW", offset, suggestPos);
        if (suggestPos) {
          const suggestions = await getSuggestions(doc.root, suggestPos);
          const { replaceOffset, replaceLength } = suggestPos;
          const from = m.getPositionAt(replaceOffset);
          const to = m.getPositionAt(replaceOffset + replaceLength);
          const range = Range.fromPositions(from, to);
          const items = suggestionsToCompletionItems(
            parseSuggestions(suggestions),
            suggestPos,
            range,
          );
          console.log("suggesting", items);
          return Promise.resolve({ suggestions: items });
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

function updatedInstance_(e: editor.IStandaloneCodeEditor): Promise<void> {
  const model = e.getModel();
  if (model) {
    return getValidation(model.getValue())
      .then(parseBasicOutput)
      .then(async (o) => {
        const doc = await parseJSONDocument(model);
        return doc ? basicOutputToMarkers(o, model, doc) : [];
      })
      .then((markers) => {
        editor.setModelMarkers(model, "instance validation", markers);
      });
  }
  return Promise.resolve();
}

function updatedSchema_(editor: editor.IStandaloneCodeEditor): Promise<void> {
  // TODO dedicated endpoint to validate schema (against its meta schema)
  return putSchema(editor.getValue());
}

async function parseJSONDocument(m: editor.ITextModel) {
  const worker: json.IJSONWorker = await (await json.getWorker())();
  return await worker.parseJSONDocument(m.uri.toString());
}

async function getSuggestions(instance: ASTNode, pos: SuggestPos) {
  const body = {
    instance: toInstance(instance),
    pointer: pos.pointer,
    inside: pos.inside,
  };
  const response = await fetch("/api/suggest", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.log("ERROR fetching suggestions", response.status);
  }
  return await response.json();
}

export async function getValidation(instance: string) {
  return fetch("/api/validate?output=basic", {
    method: "POST",
    credentials: "include",
    body: instance,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR fetching suggestions", response.status);
    }
    return response.json();
  });
}

export async function putSchema(schema: string) {
  return fetch("/api/schema", {
    method: "PUT",
    credentials: "include",
    body: schema,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR fetching suggestions", response.status);
    }
    return response.json();
  });
}
