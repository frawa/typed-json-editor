import { languages, editor, json } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api";
import { getPathAt } from "./typedJsonUtil";

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
      debugger;
      const path = doc ? getPathAt(offset, doc) : "?"
      console.log("FW", offset, path);

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

function fetchIt() {
  return fetch("/s/suggest", {
    method: "GET",
    credentials: "include",
    body: "{}",
  });
}
