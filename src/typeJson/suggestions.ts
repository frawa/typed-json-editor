import { IRange, languages } from 'monaco-editor/esm/vs/editor/editor.api.js';
import { SuggestPos } from './typedJsonUtil';

export type SuggestionOutput =
  | { location: string; values: readonly unknown[] }
  | SuggestionGroup;

export interface SuggestionGroup {
  meta: readonly string[];
  group: readonly SuggestionOutput[];
}

function isGroup(o: SuggestionOutput): o is SuggestionGroup {
  return (o as SuggestionGroup).meta !== undefined;
}

export function parseSuggestionOutput(
  json: unknown
): readonly SuggestionOutput[] {
  // TODO decoding
  return json as SuggestionOutput[];
}

export interface ValueWithMeta {
  value: unknown;
  locations: readonly string[];
  meta: readonly string[];
}

function addMeta(
  meta: readonly string[],
  o: SuggestionOutput
): readonly ValueWithMeta[] {
  if (isGroup(o)) {
    const { meta, group } = o;
    return group.flatMap((v) => addMeta(meta, v));
  } else {
    const { location, values } = o;
    const locations = [location];
    return values.map((value) => ({ value, locations, meta }));
  }
}

function ellipseText(text: string, max: number): string {
  return text.length > max ? text.substring(0, max - 3) + '...' : text;
}

export function suggestionsToCompletionItems(
  suggestions: readonly SuggestionOutput[],
  pos: SuggestPos,
  range: IRange
): languages.CompletionItem[] {
  const propertyNamesOnly =
    pos.inside === 'object'
      ? (v: ValueWithMeta) => getPropertyNames(v)
      : (v: ValueWithMeta) => [v];
  const go = ({ value, locations, meta }: ValueWithMeta) => {
    const pretty = JSON.stringify(value, null, 2);
    const compact = JSON.stringify(value, null, 0);
    const label = ellipseText(compact, 42);
    const location = locations?.[0] ?? '';
    const keyword = location.substring(location.lastIndexOf('/') + 1);
    const doc = [
      locations.map((t) => `\`${t}\`\n`),
      '',
      '```',
      pretty,
      '```',
      '',
      ...meta.map((t) => '* ' + t),
    ].join('\n');
    const labelDetail = ellipseText(meta?.[0] ?? '', 25);
    const item: languages.CompletionItem = {
      kind: languages.CompletionItemKind.Value,
      label: {
        label,
        detail: keyword,
        description: labelDetail,
        // description: keyword,
        // detail: labelDetail,
      },
      detail: `${pos.pointer} ${keyword}`,
      documentation: {
        value: doc,
      },
      insertText: pretty,
      range,
    };
    return item;
  };
  const items = toValueWithMeta(suggestions).flatMap(propertyNamesOnly).map(go);
  return [...items];
}

export function toValueWithMeta(
  suggestions: readonly SuggestionOutput[]
): readonly ValueWithMeta[] {
  const withMeta: ValueWithMeta[] = suggestions.flatMap((o) => addMeta([], o));
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

function getPropertyNames(v: ValueWithMeta): readonly ValueWithMeta[] {
  return typeof v.value === 'object'
    ? Object.keys(v.value as object).map((k) => ({ ...v, value: k }))
    : [];
}

function groupBy<K, V>(
  vs: readonly V[],
  by: (v: V) => K
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
