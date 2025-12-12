import { languages, editor, json } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api";
import { getSuggestPosAt, SuggestPos, toInstance } from "./typedJsonUtil";
import { ASTNode } from "vscode-json-languageservice";

export function enableTypedJson(model: editor.ITextModel | null) {
  return languages.registerCompletionItemProvider("json", {
    // triggerCharacters: [' ,:{'],
    triggerCharacters: [" "],

    provideCompletionItems: async (m, position, context) => {
      if (model !== m) {
        return null;
      }
      const value = m.getValue();
      const worker: json.IJSONWorker = await (await json.getWorker())();

      const doc = await worker.parseJSONDocument(m.uri.toString());
      const offset = m.getOffsetAt(position);
      // debugger;
      if (doc?.root) {
        const suggestPos = getSuggestPosAt(offset, doc);
        console.log("FW", offset, suggestPos);
        const fw =
          doc.root && suggestPos
            ? await getSuggestions(doc.root, suggestPos)
            : [];
        console.log("FW", fw);
      }

      const result = null;
      if (!result) {
        const range = Range.fromPositions(position, position).toJSON();
        const dummy: languages.CompletionItem = {
          // label: 'dummy label',
          label: {
            label: "dummy label",
            description: "dummy label description",
            detail: "dummy label detail",
          },
          // kind: 0,
          kind: languages.CompletionItemKind.Value,
          detail: "dummy detail",
          documentation: {
            value: "dummy *documentation* \n ```still documentation``` \n",
          },
          insertText: "dummy insertText",
          range,
        };
        return Promise.resolve({ suggestions: [dummy] });
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

function updatedInstance_(editor: editor.IStandaloneCodeEditor): Promise<void> {
  return getValidation(editor.getValue());
}

function updatedSchema_(editor: editor.IStandaloneCodeEditor): Promise<void> {
  return putSchema(editor.getValue());
}

async function getSuggestions(instance: ASTNode, pos: SuggestPos) {
  const body = {
    instance: toInstance(instance),
    ...pos,
  };
  const response = await fetch("/api/suggest", {
    method: "POST",
    headers: {
      // "Content-Type": "application/json",
    },
    credentials: "include",
    // credentials: "same-origin",
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

    headers: {
      // "Content-Type": "application/json",
    },
    credentials: "include",
    // credentials: "same-origin",
    body: JSON.stringify(instance),
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

    headers: {
      // "Content-Type": "application/json",
    },
    credentials: "include",
    // credentials: "same-origin",
    body: schema,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR fetching suggestions", response.status);
    }
    return response.json();
  });
}
