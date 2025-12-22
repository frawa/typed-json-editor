import { IRange, languages } from "monaco-editor/esm/vs/editor/editor.api.js";
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
  type ValueLocation = { value: any; location: string };
  const go = ({ value, location }: ValueLocation) => {
    const pretty = JSON.stringify(value, null, 2);
    const compact = JSON.stringify(value, null, 0);
    const label =
      compact.length > 42 ? compact.substring(0, 39) + "..." : compact;
    const keyword = location.substring(location.lastIndexOf("/") + 1);
    const item: languages.CompletionItem = {
      kind: languages.CompletionItemKind.Value,
      label: {
        label,
        description: pos.pointer,
        //description: TODO keyword,
        // detail: "TODO label detail",
      },
      detail: `${keyword}`,
      documentation: {
        value: `${location}\n\n\`\`\`${pretty}\`\`\`\n`,
      },
      insertText: pretty,
      range,
    };
    return item;
  };
  const withLocation = suggestions.flatMap((output) =>
    output.values.map((value) => ({ value, location: output.location })),
  );
  const grouped = groupBy(withLocation, ({ value }) => value);
  const merge = (acc: ValueLocation, v: ValueLocation) => ({
    value: v.value,
    location: `${acc.location}\n- ${v.location}`,
  });
  const merged = grouped
    .values()
    .map((vs) => vs.reduce(merge, { value: {}, location: "" }));
  const items = merged.map(go);
  return [...items];
}

function groupBy<K, V>(
  vs: readonly V[],
  by: (v: V) => K,
): ReadonlyMap<K, readonly V[]> {
  const result = new Map<K, V[]>();
  vs.forEach((v) => {
    const k = by(v);
    const group = result.get(k);
    if (group) {
      result.set(k, [...group, v]);
    } else {
      result.set(k, [v]);
    }
  });
  return result;
}
