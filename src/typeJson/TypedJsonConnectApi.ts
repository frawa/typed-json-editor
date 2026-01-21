import { apiSuggestion, apiSuggestSchema, apiValidate, apiValidateSchema, apiSchema } from "./apiClient";
import { TypedJsonConnect, SuggestFun, ValidateFun, UpdateSchemaFun } from "./typedJson";

export class TypedJsonConnectApi implements TypedJsonConnect {
    suggest: SuggestFun = apiSuggestion;
    suggestSchema: SuggestFun = apiSuggestSchema;
    validate: ValidateFun = apiValidate;
    validateSchema: ValidateFun = apiValidateSchema;
    updateSchema: UpdateSchemaFun = apiSchema;
}
