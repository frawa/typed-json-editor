import {
  editor,
  IRange,
  languages,
  MarkerSeverity,
} from "monaco-editor/esm/vs/editor/editor.api";
import { getPointerOffsets, SuggestPos } from "./typedJsonUtil";
import { JSONDocument } from "vscode-json-languageservice";

export function parseSuggestions(json: any): readonly any[] {
  // TODO decoding
  return json as any[];
}

export function suggestionsToCompletionItems(
  suggestions: readonly any[],
  pos: SuggestPos,
  range: IRange,
): languages.CompletionItem[] {
  const go = (v: any) => {
    const pretty = JSON.stringify(v, null, 2);
    const compact = JSON.stringify(v, null, 0);
    const label =
      compact.length > 42 ? compact.substring(0, 39) + "..." : compact;
    const item: languages.CompletionItem = {
      kind: languages.CompletionItemKind.Value,
      label: {
        label,
        description: pos.pointer,
        //description: TODO keyword,
        // detail: "TODO label detail",
      },
      detail: "TODO schema keyword detail",
      documentation: {
        value: `\n\`\`\`${pretty}\`\`\`\n`,
      },
      insertText: pretty,
      range,
    };
    return item;
  };
  return suggestions.map(go);
}
