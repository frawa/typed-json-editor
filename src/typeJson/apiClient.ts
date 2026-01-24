import { BasicOutput, parseBasicOutput } from "./basicOutput";
import { SuggestionOutput, parseSuggestionOutput } from "./suggestions";
import { SuggestPos } from "./typedJsonUtil";

export async function apiSchema(schema: string): Promise<string> {
  return fetch("api/schema", {
    method: "PUT",
    credentials: "include",
    body: schema,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR putting schema", response.status);
    }
    return parseSession(response.json());
  });
}

export function parseSession(json: any): string {
  // TODO decoding
  return (json as { session: string }).session;
}

export async function apiSuggestion(
  instance: string,
  pos: SuggestPos,
): Promise<readonly SuggestionOutput[]> {
  const body = {
    instance: JSON.parse(instance),
    pointer: pos.pointer,
    inside: pos.inside,
  };
  const response = await fetch("api/suggest", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.log("ERROR fetching instance suggestions", response.status);
  }
  const raw = await response.json();
  return parseSuggestionOutput(raw);
}

export async function apiSuggestSchema(
  instance: string,
  pos: SuggestPos,
): Promise<readonly SuggestionOutput[]> {
  const body = {
    instance: JSON.parse(instance),
    pointer: pos.pointer,
    inside: pos.inside,
  };
  const response = await fetch("api/suggestSchema", {
    method: "POST",
    // credentials: "include",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    console.log("ERROR fetching schema suggestions", response.status);
  }
  const raw = await response.json();
  return parseSuggestionOutput(raw);
}

export async function apiValidate(instance: string): Promise<BasicOutput> {
  return fetch("api/validate?output=basic", {
    method: "POST",
    credentials: "include",
    body: instance,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR validating instance", response.status);
    }
    const raw = response.json();
    return parseBasicOutput(raw);
  });
}

export async function apiValidateSchema(
  instance: string,
): Promise<BasicOutput> {
  return fetch("api/validateSchema?output=basic", {
    method: "POST",
    // credentials: "include",
    body: instance,
  }).then((response) => {
    if (!response.ok) {
      console.log("ERROR validating schema", response.status);
    }
    const raw = response.json();
    return parseBasicOutput(raw);
  });
}
