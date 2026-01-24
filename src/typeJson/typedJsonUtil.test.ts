import { describe, expect, test } from "vitest";
// import {
//     getLanguageService,
//     JSONDocument,
//     TextDocument,
// } from "vscode-json-languageservice";
import { Node } from 'jsonc-parser';
import {
  getPointerOffsets,
  getSuggestPosAt,
  parseJson,
  // toInstance,
} from "./typedJsonUtil";

describe("typedJson utils", () => {
  // const jsonLanguageService = getLanguageService({});

  function parse(text: string): Node {
    // const td = TextDocument.create("", "json", 13, text);
    // const doc = jsonLanguageService.parseJSONDocument(td);
    return parseJson(text) ?? { type: 'null', offset: 0, length: 0 };
  }

  test("suggest pos for number", () => {
    const value = "13";
    const doc = value;// parse(value);
    const expected = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected);
    expect(getSuggestPosAt(1, doc)).toEqual(expected);
    expect(getSuggestPosAt(2, doc)).toEqual(undefined);
  });

  test("suggest pos for array", () => {
    const value = "[13,14]";
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 7,
    };
    const expected0b = {
      ...expected0,
      inside: true,
      replaceOffset: 3,
      replaceLength: 0,
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
    const expected3 = {
      pointer: "",
      inside: true,
      replaceOffset: 6,
      replaceLength: 0,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected0b); // TODO inside true
    expect(getSuggestPosAt(4, doc)).toEqual(expected2);
    expect(getSuggestPosAt(5, doc)).toEqual(expected2);
    expect(getSuggestPosAt(6, doc)).toEqual(expected3);
    expect(getSuggestPosAt(7, doc)).toEqual(undefined);
  });

  test("suggest pos for broken array", () => {
    const value = "[13";
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
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

  test("suggest pos for broken array with more elements", () => {
    const value = "[13,,14";
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 7,
    };
    const expected0b = {
      ...expected0,
      inside: true,
      replaceOffset: 3,
      replaceLength: 0,
    };
    const expected0c = {
      ...expected0,
      inside: true,
      replaceOffset: 4,
      replaceLength: 0,
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
    expect(getSuggestPosAt(4, doc)).toEqual(expected0c);
    expect(getSuggestPosAt(5, doc)).toEqual(expected2);
    expect(getSuggestPosAt(6, doc)).toEqual(expected2);
    expect(getSuggestPosAt(7, doc)).toEqual(undefined);
  });

  test("suggest pos for object", () => {
    const value = '{"foo":13}';
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 10,
    };
    const expected1 = {
      pointer: "",
      inside: true,
      replaceOffset: 1,
      replaceLength: 5,
    };
    const expected2 = {
      pointer: "/foo",
      inside: false,
      replaceOffset: 7,
      replaceLength: 2,
    };
    const expected3 = {
      pointer: "",
      inside: true,
      replaceOffset: 9,
      replaceLength: 0,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected1);
    expect(getSuggestPosAt(4, doc)).toEqual(expected1);
    expect(getSuggestPosAt(5, doc)).toEqual(expected1);
    expect(getSuggestPosAt(6, doc)).toEqual(expected1);
    expect(getSuggestPosAt(7, doc)).toEqual(expected2);
    expect(getSuggestPosAt(8, doc)).toEqual(expected2);
    expect(getSuggestPosAt(9, doc)).toEqual(expected3);
    expect(getSuggestPosAt(10, doc)).toEqual(undefined);
  });

  test("suggest pos for broken object property value", () => {
    const value = '{"foo":}';
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 8,
    };
    const expected1 = {
      pointer: "",
      inside: true,
      replaceOffset: 1,
      replaceLength: 5,
    };
    const expected2 = {
      pointer: "/foo",
      inside: false,
      replaceOffset: 7,
      replaceLength: 0,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected1);
    expect(getSuggestPosAt(4, doc)).toEqual(expected1);
    expect(getSuggestPosAt(5, doc)).toEqual(expected1);
    expect(getSuggestPosAt(6, doc)).toEqual(expected1);
    expect(getSuggestPosAt(7, doc)).toEqual(expected2);
    expect(getSuggestPosAt(8, doc)).toEqual(undefined);
  });
  test("suggest pos for broken object only key", () => {
    const value = '{"foo" }';
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 8,
    };
    const expected1 = {
      pointer: "",
      inside: true,
      replaceOffset: 1,
      replaceLength: 5,
    };
    const expected2 = {
      pointer: "",
      inside: true,
      replaceOffset: 1,
      replaceLength: 5,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected1);
    expect(getSuggestPosAt(3, doc)).toEqual(expected1);
    expect(getSuggestPosAt(4, doc)).toEqual(expected1);
    expect(getSuggestPosAt(5, doc)).toEqual(expected1);
    expect(getSuggestPosAt(6, doc)).toEqual(expected2);
    expect(getSuggestPosAt(7, doc)).toEqual(expected2);
    expect(getSuggestPosAt(8, doc)).toEqual(undefined);
  });

  test("suggest pos for samples", () => {
    const value = "{ }";
    const doc = value; //parse(value);
    const expected0 = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 3,
    };
    const expected1 = {
      pointer: "",
      inside: true,
      replaceOffset: 1,
      replaceLength: 0,
    };
    const expected2 = {
      pointer: "",
      inside: true,
      replaceOffset: 2,
      replaceLength: 0,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected0);
    expect(getSuggestPosAt(1, doc)).toEqual(expected1);
    expect(getSuggestPosAt(2, doc)).toEqual(expected2);
    expect(getSuggestPosAt(3, doc)).toEqual(undefined);
  });

  test("suggest pos for empty", () => {
    const value = "";
    const doc = value; //parse(value);
    const expected = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 0,
    };
    expect(getSuggestPosAt(0, doc)).toEqual(expected);
  });

  test("offsets for broken pointer", () => {
    const value = "13";
    const doc = parse(value);
    expect(getPointerOffsets("broken", doc)).toEqual(undefined);
  });

  test("offsets for pointer", () => {
    const value = "13";
    const doc = parse(value);
    expect(getPointerOffsets("", doc)).toEqual({ offset: 0, length: 2 });
    expect(getPointerOffsets("/", doc)).toEqual({ offset: 0, length: 2 });
  });
  test("offsets for array", () => {
    const value = "[13,14]";
    const doc = parse(value);
    expect(getPointerOffsets("", doc)).toEqual({ offset: 0, length: 7 });
    expect(getPointerOffsets("/", doc)).toEqual({ offset: 0, length: 7 });
    expect(getPointerOffsets("/0", doc)).toEqual({ offset: 1, length: 2 });
    expect(getPointerOffsets("/1", doc)).toEqual({ offset: 4, length: 2 });
    expect(getPointerOffsets("/13", doc)).toEqual(undefined);
  });
  test("offsets for object", () => {
    const value = '{"foo":13}';
    const doc = parse(value);
    expect(getPointerOffsets("", doc)).toEqual({ offset: 0, length: 10 });
    expect(getPointerOffsets("/", doc)).toEqual({ offset: 0, length: 10 });
    expect(getPointerOffsets("/foo", doc)).toEqual({ offset: 7, length: 2 });
    expect(getPointerOffsets("/1", doc)).toEqual(undefined);
    expect(getPointerOffsets("/bar", doc)).toEqual(undefined);
  });
  test("offsets for broken object", () => {
    const value = '{"foo":}';
    const doc = parse(value);
    expect(getPointerOffsets("", doc)).toEqual({ offset: 0, length: 8 });
    expect(getPointerOffsets("/", doc)).toEqual({ offset: 0, length: 8 });
    expect(getPointerOffsets("/foo", doc)).toEqual({ offset: 1, length: 5 });
    expect(getPointerOffsets("/bar", doc)).toEqual(undefined);
  });

  // test("toInstance for empty sub object", () => {
  //   const value = '{"foo":{}}'
  //   const doc = parse(value);
  //   expect(toInstance(doc.root!)).toEqual({ foo: {} });
  // });
});
