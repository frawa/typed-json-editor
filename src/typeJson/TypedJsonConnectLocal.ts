import { BasicOutput, parseBasicOutput } from "./basicOutput";
import { SuggestionOutput, parseSuggestionOutput } from "./suggestions";
import { SuggestFun, TypedJsonConnect, UpdateSchemaFun, ValidateFun } from "./typedJson";
import { SuggestPos } from "./typedJsonUtil";

type LocalValidateFun = (arg: [string, string]) => string
type LocalValidateSchemaFun = (arg: string) => string
type LocalSuggestFun = (arg: [string, string]) => string
type LocalSuggestSchemaFun = (arg: string) => string

export class TypedJsonConnectLocal implements TypedJsonConnect {
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


    private doSuggest(instance: string, pos: SuggestPos): Promise<readonly SuggestionOutput[]> {
        const body = {
            instance: JSON.parse(instance),
            pointer: pos.pointer,
            inside: pos.inside,
        };
        try {
            const result = this.localSuggest([this.schema, JSON.stringify(body)]);
            const o: readonly SuggestionOutput[] = parseSuggestionOutput(JSON.parse(result));
            return Promise.resolve(o);
        } catch (e) {
            console.log("local suggest failed", e);
            return Promise.resolve([]);
        }
    }

    private doSuggestSchema(instance: string, pos: SuggestPos): Promise<readonly SuggestionOutput[]> {
        const body = {
            instance: JSON.parse(instance),
            pointer: pos.pointer,
            inside: pos.inside,
        };
        try {
            const result = this.localSuggestSchema(JSON.stringify(body));
            const o: readonly SuggestionOutput[] = parseSuggestionOutput(JSON.parse(result));
            return Promise.resolve(o);
        } catch (e) {
            console.log("local suggest schema failed", e);
            return Promise.resolve([]);
        }
    }

    private doValidate(instance: string): Promise<BasicOutput> {
        // console.log("local validate", this.schema, instance);
        try {
            const result = this.localValidate([this.schema, instance]);
            const o: BasicOutput = parseBasicOutput(JSON.parse(result));
            return Promise.resolve(o);
        } catch (e) {
            console.log("local validate failed", e);
            return Promise.resolve({ valid: false });
        }
    }

    private doValidateSchema(schema: string): Promise<BasicOutput> {
        // console.log("local validate schema", schema);
        try {
            const result = this.localValidateSchema(schema);
            const o: BasicOutput = parseBasicOutput(JSON.parse(result));
            return Promise.resolve(o);
        } catch (e) {
            console.log("local validate schema failed", e);
            return Promise.resolve({ valid: false });
        }
    }

    private doUpdateSchema(schema: string): Promise<string> {
        // console.log("local update schema", schema);
        this.schema = schema;
        return Promise.resolve("");
    }
}
