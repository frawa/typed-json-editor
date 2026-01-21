import { editor, json, languages } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api.js";
import { ASTNode } from "vscode-json-languageservice";

import { BasicOutput, basicOutputToMarkers } from "./basicOutput";
import { SuggestionOutput, suggestionsToCompletionItems } from "./suggestions";
import { TypedJsonConnectApi } from "./TypedJsonConnectApi";
import { TypedJsonConnectLocal } from "./TypedJsonConnectLocal";
import { getSuggestPosAt, SuggestPos } from "./typedJsonUtil";

export type SuggestFun = (
  n: ASTNode,
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
      const doc = await parseJSONDocument(m);
      const offset = m.getOffsetAt(position);

      if (doc?.root) {
        const suggestPos = getSuggestPosAt(offset, doc);
        if (suggestPos) {
          const output = await suggest(doc.root, suggestPos);
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
    const basicOutput = await arg.validate(model.getValue());
    const doc = await parseJSONDocument(model);
    const markers = doc ? basicOutputToMarkers(basicOutput, model, doc) : [];
    editor.setModelMarkers(model, "instance validation", markers);
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
    const basicOutput = await arg.validateSchema(value);
    const doc = await parseJSONDocument(model);
    const markers = doc ? basicOutputToMarkers(basicOutput, model, doc) : [];
    editor.setModelMarkers(model, "schema validation", markers);
    if (basicOutput.valid) {
      await arg.updateSchema(value);
    }
    return basicOutput.valid;
  }
  return Promise.resolve(false);
}

async function parseJSONDocument(m: editor.ITextModel) {
  const worker: json.IJSONWorker = await (await json.getWorker())();
  return await worker.parseJSONDocument(m.uri.toString());
}
