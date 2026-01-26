// DONT import monaco-editor
// import { json } from "monaco-editor";
import 'monaco-editor/esm/vs/editor/editor.all.js';


import { editor, languages, Range } from "monaco-editor/esm/vs/editor/editor.api.js";
// import { getWorker } from 'monaco-editor/esm/vs/language/json/monaco.contribution.js';
// import { ASTNode } from "vscode-json-languageservice";

import { BasicOutput, basicOutputToMarkers } from "./basicOutput";
import { SuggestionOutput, suggestionsToCompletionItems } from "./suggestions";
import { TypedJsonConnectApi } from "./TypedJsonConnectApi";
import { TypedJsonConnectLocal } from "./TypedJsonConnectLocal";
import { getSuggestPosAt, parseJson, parseTolerantJson, SuggestPos } from "./typedJsonUtil";

export type SuggestFun = (
  instance: string,
  pos: SuggestPos,
) => Promise<readonly SuggestionOutput[]>;

export type ValidateFun = (
  instance: string,
) => Promise<BasicOutput>;

export type UpdateSchemaFun = (
  schema: string,
) => Promise<string>;

export interface TypedJsonConnect {
  readonly suggest: SuggestFun;
  readonly suggestSchema: SuggestFun;
  readonly validate: ValidateFun;
  readonly validateSchema: ValidateFun;
  readonly updateSchema: UpdateSchemaFun;
}

export function apiConnect(): TypedJsonConnect { return new TypedJsonConnectApi(); }
export function localConnect(): TypedJsonConnect { return new TypedJsonConnectLocal(); }

export function enableTypedJson(
  model: editor.ITextModel | null,
  suggest: SuggestFun,
) {
  return languages.registerCompletionItemProvider("json", {
    // triggerCharacters: [' ,:{'],
    // triggerCharacters: [" "],
    triggerCharacters: [], // default is ctrl-space

    provideCompletionItems: async (m, position) => {
      if (model !== m) {
        return null;
      }
      const text = m.getValue();
      const tree = parseTolerantJson(text);
      const offset = m.getOffsetAt(position);

      if (tree) {
        const suggestPos = getSuggestPosAt(offset, tree);
        if (suggestPos) {
          const output = await suggest(text, suggestPos);
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
            // console.log("suggesting", suggestPos, items);
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

async function updatedInstance_(arg: {
  validate: ValidateFun,
  e: editor.IStandaloneCodeEditor,
}
): Promise<void> {
  const model = arg.e.getModel();
  if (model) {
    const value = model.getValue();
    const tree = parseJson(value);
    if (tree) {
      const basicOutput = await arg.validate(value);
      const markers = tree ? basicOutputToMarkers(basicOutput, model, tree) : [];
      editor.setModelMarkers(model, "instance validation", markers);
    }
  }
  return Promise.resolve();
}

async function updatedSchema_(arg: {
  validateSchema: ValidateFun,
  updateSchema: UpdateSchemaFun,
  e: editor.IStandaloneCodeEditor,
}
): Promise<boolean> {
  const model = arg.e.getModel();
  if (model) {
    const value = model.getValue();
    const tree = await parseJson(value);
    if (tree) {
      const basicOutput = await arg.validateSchema(value);
      const markers = basicOutputToMarkers(basicOutput, model, tree);
      editor.setModelMarkers(model, "schema validation", markers);
      if (basicOutput.valid) {
        await arg.updateSchema(value);
      }
      return basicOutput.valid;
    }
  }
  return Promise.resolve(false);
}

