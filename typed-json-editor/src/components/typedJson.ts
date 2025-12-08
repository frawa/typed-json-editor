
import { languages, editor } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api";

export function enableTypedJson(model: editor.ITextModel | null) {
    return languages.registerCompletionItemProvider("json", {
        // triggerCharacters: [' ,:{'],
        triggerCharacters: [" "],

        provideCompletionItems: (m, position, context) => {
            if (model !== m) {
                return null;
            }
            const result = null;
            if (!result) {
                const range = Range.fromPositions(position, position).toJSON();
                const dummy: languages.CompletionItem = {
                    // label: 'dummy label',
                    label: { label: 'dummy label', description: 'dummy label description', detail: 'dummy label detail' },
                    // kind: 0,
                    kind: languages.CompletionItemKind.Value,
                    detail: "dummy detail",
                    documentation: {
                        value: "dummy *documentation* \n ```still documentation``` \n"
                    },
                    insertText: 'dummy insertText',
                    range
                };
                return {
                    suggestions: [dummy],
                };
            }
        },
    });

}