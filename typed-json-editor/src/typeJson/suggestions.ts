import {
  IRange,
  languages
} from "monaco-editor/esm/vs/editor/editor.api";
import { SuggestPos } from "./typedJsonUtil";

export type SuggestionOutput = { location: string; values: readonly any[] };

export function parseSuggestionOutput(json: any): readonly SuggestionOutput[] {
  // TODO decoding
  return json as SuggestionOutput[];
}

export function suggestionsToCompletionItems(
  suggestions: readonly SuggestionOutput[],
  pos: SuggestPos,
  range: IRange,
): languages.CompletionItem[] {
  const go = (location: string) => (v: any) => {
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
      detail: `${location}`, //"TODO schema keyword detail",
      documentation: {
        value: `\n\`\`\`${pretty}\`\`\`\n`,
      },
      insertText: pretty,
      range,
    };
    return item;
  };
  return suggestions.flatMap(output => {
    return output.values.map(go(output.location))
  });
}
