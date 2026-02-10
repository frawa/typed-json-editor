import { IRange, languages } from "monaco-editor/esm/vs/editor/editor.api.js";
import { SuggestPos } from "./typedJsonUtil";

export type SuggestionOutput =
  { location: string; values: readonly any[] }
  | SuggestionGroup;

export type SuggestionGroup =
  { meta: readonly string[]; group: readonly SuggestionOutput[] };

function isGroup(o: SuggestionOutput): o is SuggestionGroup {
  return (o as SuggestionGroup).meta !== undefined;
}

export function parseSuggestionOutput(json: any): readonly SuggestionOutput[] {
  // TODO decoding
  return json as SuggestionOutput[];
}

export type ValueWithMeta = { value: any; locations: readonly string[]; meta: readonly string[] };

function addMeta(meta: readonly string[], o: SuggestionOutput): readonly ValueWithMeta[] {
  if (isGroup(o)) {
    const { meta, group } = o;
    return group.flatMap(v => addMeta(meta, v));
  } else {
    const { location, values } = o;
    const locations = [location];
    return values.map(value => ({ value, locations, meta }));
  }
}

export function suggestionsToCompletionItems(
  suggestions: readonly SuggestionOutput[],
  pos: SuggestPos,
  range: IRange,
): languages.CompletionItem[] {
  const go = ({ value, locations, meta }: ValueWithMeta) => {
    const pretty = JSON.stringify(value, null, 2);
    const compact = JSON.stringify(value, null, 0);
    const label =
      compact.length > 42 ? compact.substring(0, 39) + "..." : compact;
    const location = locations?.[0] ?? '';
    const keyword = location.substring(location.lastIndexOf("/") + 1);
    const docMeta = meta.join("\n");
    const docLocations = locations.join("\n");
    const doc = [docMeta, docLocations].join("\n\n")
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
        value: `${doc}\n\n\`\`\`${pretty}\`\`\`\n`,
      },
      insertText: pretty,
      range,
    };
    return item;
  };
  const items = toValueWithMeta(suggestions).map(go);
  return [...items];
}

export function toValueWithMeta(suggestions: readonly SuggestionOutput[]): readonly ValueWithMeta[] {
  const withMeta: ValueWithMeta[] = suggestions.flatMap(o => addMeta([], o));
  const grouped = groupBy(withMeta, ({ value }) => value);
  const merge = (acc: ValueWithMeta, v: ValueWithMeta) => ({
    value: v.value,
    locations: [...acc.locations, ...v.locations],
    meta: [...acc.meta, ...v.meta],
  });
  const merged = grouped
    .values()
    .map((vs) => vs.reduce(merge, { value: {}, locations: [], meta: [] }))
    .toArray();
  return merged;
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
