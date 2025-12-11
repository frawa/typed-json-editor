import { describe, test, expect } from "vitest";

// import { languages, editor, json } from "monaco-editor";
// import * as monaco from "monaco-editor";

// import { getNodePath, getNodeValue, JSONDocument } from 'monaco-editor/esm/external/vscode-json-languageservice/lib/esm/parser/jsonParser';
import {
  getLanguageService,
  JSONDocument,
  TextDocument,
} from "vscode-json-languageservice";
import { getSuggestPosAt } from "./typedJsonUtil";

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
    const expected = {
      pointer: "/",
      inside: false,
      replaceOffset: 0,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected);
    expect(getSuggestPosAt(1, doc)).toEqual(expected);
    expect(getSuggestPosAt(2, doc)).toEqual(undefined);
  });

  test("paths for array", () => {
    const value = "[13,14]";
    const doc = parse(value);
    const expected0 = {
      pointer: "/",
      inside: false,
      replaceOffset: 0,
      replaceLength: 7,
    };
    const expected0b = {
      ...expected0,
      inside: true,
    };
    const expected1 = {
      pointer: "/0",
      inside: false,
      replaceOffset: 1,
      replaceLength: 2,
    };
    const expected2 = {
      pointer: "/1",
      inside: false,
      replaceOffset: 4,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected0b); // TODO inside true
    expect(getSuggestPosAt(4, doc)).toEqual(expected2);
    expect(getSuggestPosAt(5, doc)).toEqual(expected2);
    expect(getSuggestPosAt(6, doc)).toEqual(expected0);
    expect(getSuggestPosAt(7, doc)).toEqual(undefined);
    expect(getSuggestPosAt(8, doc)).toEqual(undefined);
  });

  test("paths for broken array", () => {
    const value = "[13";
    const doc = parse(value);
    const expected0 = {
      pointer: "/",
      inside: false,
      replaceOffset: 0,
      replaceLength: 3,
    };
    const expected1 = {
      pointer: "/0",
      inside: false,
      replaceOffset: 1,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(undefined);
  });

  test("paths for broken array with more elements", () => {
    const value = "[13,,14";
    const doc = parse(value);
    const expected0 = {
      pointer: "/",
      inside: false,
      replaceOffset: 0,
      replaceLength: 7,
    };
    const expected0b = {
      ...expected0,
      inside: true,
    };
    const expected1 = {
      pointer: "/0",
      inside: false,
      replaceOffset: 1,
      replaceLength: 2,
    };
    const expected2 = {
      pointer: "/1",
      inside: false,
      replaceOffset: 5,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected0b);
    expect(getSuggestPosAt(4, doc)).toEqual(expected0b);
    expect(getSuggestPosAt(5, doc)).toEqual(expected2);
    expect(getSuggestPosAt(6, doc)).toEqual(expected2);
    expect(getSuggestPosAt(7, doc)).toEqual(undefined);
  });

  test("paths for object", () => {
    const value = '{"foo":13}';
    const doc = parse(value);
    const expected0 = {
      pointer: "/",
      inside: false,
      replaceOffset: 0,
      replaceLength: 10,
    };
    const expected1 = {
      pointer: "/foo",
      inside: true,
      replaceOffset: 1,
      replaceLength: 5,
    };
    const expected2 = {
      pointer: "/",
      inside: true,
      replaceOffset: 1,
      replaceLength: 8,
    };
    const expected3 = {
      pointer: "/foo",
      inside: false,
      replaceOffset: 7,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected1);
    expect(getSuggestPosAt(4, doc)).toEqual(expected1);
    expect(getSuggestPosAt(5, doc)).toEqual(expected1);
    expect(getSuggestPosAt(6, doc)).toEqual(expected2);
    expect(getSuggestPosAt(7, doc)).toEqual(expected3);
    expect(getSuggestPosAt(8, doc)).toEqual(expected3);
    expect(getSuggestPosAt(9, doc)).toEqual(expected0);
    expect(getSuggestPosAt(10, doc)).toEqual(undefined);
  });
});
