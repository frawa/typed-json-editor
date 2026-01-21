import { editor, json, languages } from "monaco-editor";
import { Range } from "monaco-editor/esm/vs/editor/editor.api.js";
import { ASTNode } from "vscode-json-languageservice";
import { apiSchema, apiSuggestion, apiSuggestSchema, apiValidate, apiValidateSchema } from "./apiClient";
import { BasicOutput, basicOutputToMarkers, parseBasicOutput } from "./basicOutput";
import { parseSuggestionOutput, SuggestionOutput, suggestionsToCompletionItems } from "./suggestions";
import { getSuggestPosAt, SuggestPos, toInstance } from "./typedJsonUtil";

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

class TypedJsonConnectApi implements TypedJsonConnect {
  suggest: SuggestFun = apiSuggestion;
  suggestSchema: SuggestFun = apiSuggestSchema;
  validate: ValidateFun = apiValidate;
  validateSchema: ValidateFun = apiValidateSchema;
  updateSchema: UpdateSchemaFun = apiSchema;
}

type LocalValidateFun = (arg: [string, string]) => string
type LocalValidateSchemaFun = (arg: string) => string
type LocalSuggestFun = (arg: [string, string]) => string
type LocalSuggestSchemaFun = (arg: string) => string

class TypedJsonConnectLocal implements TypedJsonConnect {
  validate: ValidateFun = v => this.doValidate(v);
  validateSchema: ValidateFun = v => this.doValidateSchema(v);
  updateSchema: UpdateSchemaFun = v => this.doUpdateSchema(v);
  suggest: SuggestFun = (n, p) => this.doSuggest(n, p);
  suggestSchema: SuggestFun = (n, p) => this.doSuggestSchema(n, p);

  private schema: string = "{}";

  // @ts-ignore
  private localValidate: LocalValidateFun = window['validate'] as LocalValidateFun;
  // @ts-ignore
  private localValidateSchema: LocalValidateSchemaFun = window['validateSchema'] as LocalValidateSchemaFun;
  // @ts-ignore
  private localSuggest: LocalSuggestFun = window['suggest'] as LocalSuggestFun;
  // @ts-ignore
  private localSuggestSchema: LocalSuggestSchemaFun = window['suggestSchema'] as LocalSuggestSchemaFun;


  private doSuggest(node: ASTNode, pos: SuggestPos): Promise<readonly SuggestionOutput[]> {
    const body = {
      instance: toInstance(node),
      pointer: pos.pointer,
      inside: pos.inside,
    };
    try {
      const result = this.localSuggest([this.schema, JSON.stringify(body)]);
      const o: readonly SuggestionOutput[] = parseSuggestionOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("local suggest failed", e);
      return Promise.resolve([])
    }
  }

  private doSuggestSchema(node: ASTNode, pos: SuggestPos): Promise<readonly SuggestionOutput[]> {
    const body = {
      instance: toInstance(node),
      pointer: pos.pointer,
      inside: pos.inside,
    };
    try {
      const result = this.localSuggestSchema(JSON.stringify(body));
      const o: readonly SuggestionOutput[] = parseSuggestionOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("local suggest schema failed", e);
      return Promise.resolve([])
    }
  }

  private doValidate(instance: string): Promise<BasicOutput> {
    console.log("local validate", this.schema, instance);
    try {
      const result = this.localValidate([this.schema, instance]);
      const o: BasicOutput = parseBasicOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("local validate failed", e);
      return Promise.resolve({ valid: false })
    }
  }

  private doValidateSchema(schema: string): Promise<BasicOutput> {
    console.log("local validate schema", schema);
    try {
      const result = this.localValidateSchema(schema);
      console.log("local validate schema", schema, result);
      const o: BasicOutput = parseBasicOutput(JSON.parse(result));
      return Promise.resolve(o);
    } catch (e) {
      console.log("local validate schema failed", e);
      return Promise.resolve({ valid: false })
    }
  }

  private doUpdateSchema(schema: string): Promise<string> {
    console.log("local update schema", schema);
    this.schema = schema;
    return Promise.resolve("")
  }
}

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
