import { describe, test, expect } from "vitest";

// import { languages, editor, json } from "monaco-editor";
// import * as monaco from "monaco-editor";

// import { getNodePath, getNodeValue, JSONDocument } from 'monaco-editor/esm/external/vscode-json-languageservice/lib/esm/parser/jsonParser';
import {
  getLanguageService,
  JSONDocument,
  TextDocument,
} from "vscode-json-languageservice";
import { getPathAt } from "./typedJsonUtil";

describe("typedJson utils", () => {
  const jsonLanguageService = getLanguageService({});

  function parse(text: string): JSONDocument {
    const td = TextDocument.create("", "json", 13, text);
    const doc = jsonLanguageService.parseJSONDocument(td);
    return doc;
  }

  test("paths for number", () => {
    const value = "13";
    const doc = parse(value);
    expect(getPathAt(0, doc)).toEqual("/");
    expect(getPathAt(1, doc)).toEqual("/");
    expect(getPathAt(2, doc)).toEqual("");
  });

  test("paths for array", () => {
    const value = "[13,14]";
    const doc = parse(value);
    expect(getPathAt(0, doc)).toEqual("/");
    expect(getPathAt(1, doc)).toEqual("/0");
    expect(getPathAt(2, doc)).toEqual("/0");
    expect(getPathAt(3, doc)).toEqual("/");
    expect(getPathAt(4, doc)).toEqual("/1");
    expect(getPathAt(5, doc)).toEqual("/1");
    expect(getPathAt(6, doc)).toEqual("/");
    expect(getPathAt(7, doc)).toEqual("");
    expect(getPathAt(8, doc)).toEqual("");
  });

  test("paths for broken array", () => {
    const value = "[13";
    const doc = parse(value);
    expect(getPathAt(0, doc)).toEqual("/");
    expect(getPathAt(1, doc)).toEqual("/0");
    expect(getPathAt(2, doc)).toEqual("/0");
    expect(getPathAt(3, doc)).toEqual("");
  });

  test("paths for broken array with more elements", () => {
    const value = "[13,,14";
    const doc = parse(value);
    expect(getPathAt(0, doc)).toEqual("/");
    expect(getPathAt(1, doc)).toEqual("/0");
    expect(getPathAt(2, doc)).toEqual("/0");
    expect(getPathAt(3, doc)).toEqual("/");
    expect(getPathAt(4, doc)).toEqual("/");
    expect(getPathAt(5, doc)).toEqual("/1");
    expect(getPathAt(6, doc)).toEqual("/1");
    expect(getPathAt(7, doc)).toEqual("");
    expect(getPathAt(8, doc)).toEqual("");
    expect(getPathAt(9, doc)).toEqual("");
  });

  test("paths for object", () => {
    const value = '{"foo":13}';
    const doc = parse(value);
    // expect(getPathAt(0, doc)).toEqual("/");
    expect(getPathAt(1, doc)).toEqual("/foo");
    expect(getPathAt(2, doc)).toEqual("/foo");
    expect(getPathAt(3, doc)).toEqual("/foo");
    expect(getPathAt(4, doc)).toEqual("/foo");
    expect(getPathAt(5, doc)).toEqual("/foo");
    expect(getPathAt(6, doc)).toEqual("/");
    expect(getPathAt(7, doc)).toEqual("/foo");
    expect(getPathAt(8, doc)).toEqual("/foo");
    expect(getPathAt(9, doc)).toEqual("/");
    expect(getPathAt(10, doc)).toEqual("");
  });
});
