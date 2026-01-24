import { describe, expect, test } from "vitest";
// import {
//     getLanguageService,
//     JSONDocument,
//     TextDocument,
// } from "vscode-json-languageservice";
import { Node, parseTree } from 'jsonc-parser';
import {
  getPointerOffsets,
  getSuggestPosAt,
  parseJson,
  // toInstance,
} from "./typedJsonUtil";

describe("typedJson utils", () => {

  function parse(text: string): Node {
    const result = parseTree(text);
    return result ?? { type: 'null', offset: 0, length: 0 };
  }

  test("suggest pos for number", () => {
    const value = "13";
    const tree = parse(value);
    const expected = {
      pointer: "",
      inside: false,
      replaceOffset: 0,
      replaceLength: 2,
    };
    expect(getSuggestPosAt(0, tree)).toEqual(expected);
    expect(getSuggestPosAt(1, tree)).toEqual(expected);
    expect(getSuggestPosAt(2, tree)).toEqual(undefined);
  });

  test("suggest pos for array", () => {
    const value = "[13,14]";
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(expected0b); // TODO inside true
    expect(getSuggestPosAt(4, tree)).toEqual(expected2);
    expect(getSuggestPosAt(5, tree)).toEqual(expected2);
    expect(getSuggestPosAt(6, tree)).toEqual(expected3);
    expect(getSuggestPosAt(7, tree)).toEqual(undefined);
  });

  test("suggest pos for broken array", () => {
    const value = "[13";
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(undefined);
  });

  test("suggest pos for broken array with more elements", () => {
    const value = "[13,,14";
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(expected0b);
    expect(getSuggestPosAt(4, tree)).toEqual(expected0c);
    expect(getSuggestPosAt(5, tree)).toEqual(expected2);
    expect(getSuggestPosAt(6, tree)).toEqual(expected2);
    expect(getSuggestPosAt(7, tree)).toEqual(undefined);
  });

  test("suggest pos for object", () => {
    const value = '{"foo":13}';
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(expected1);
    expect(getSuggestPosAt(4, tree)).toEqual(expected1);
    expect(getSuggestPosAt(5, tree)).toEqual(expected1);
    expect(getSuggestPosAt(6, tree)).toEqual(expected1);
    expect(getSuggestPosAt(7, tree)).toEqual(expected2);
    expect(getSuggestPosAt(8, tree)).toEqual(expected2);
    expect(getSuggestPosAt(9, tree)).toEqual(expected3);
    expect(getSuggestPosAt(10, tree)).toEqual(undefined);
  });

  test("suggest pos for broken object property value", () => {
    const value = '{"foo":}';
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(expected1);
    expect(getSuggestPosAt(4, tree)).toEqual(expected1);
    expect(getSuggestPosAt(5, tree)).toEqual(expected1);
    expect(getSuggestPosAt(6, tree)).toEqual(expected1);
    expect(getSuggestPosAt(7, tree)).toEqual(expected2);
    expect(getSuggestPosAt(8, tree)).toEqual(undefined);
  });
  test("suggest pos for broken object only key", () => {
    const value = '{"foo" }';
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected1);
    expect(getSuggestPosAt(3, tree)).toEqual(expected1);
    expect(getSuggestPosAt(4, tree)).toEqual(expected1);
    expect(getSuggestPosAt(5, tree)).toEqual(expected1);
    expect(getSuggestPosAt(6, tree)).toEqual(expected2);
    expect(getSuggestPosAt(7, tree)).toEqual(expected2);
    expect(getSuggestPosAt(8, tree)).toEqual(undefined);
  });

  test("suggest pos for samples", () => {
    const value = "{ }";
    const tree = parse(value);
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
    expect(getSuggestPosAt(0, tree)).toEqual(expected0);
    expect(getSuggestPosAt(1, tree)).toEqual(expected1);
    expect(getSuggestPosAt(2, tree)).toEqual(expected2);
    expect(getSuggestPosAt(3, tree)).toEqual(undefined);
  });

  test("offsets for broken pointer", () => {
    const value = "13";
    const tree = parse(value);
    expect(getPointerOffsets("broken", tree)).toEqual(undefined);
  });

  test("offsets for pointer", () => {
    const value = "13";
    const tree = parse(value);
    expect(getPointerOffsets("", tree)).toEqual({ offset: 0, length: 2 });
    expect(getPointerOffsets("/", tree)).toEqual({ offset: 0, length: 2 });
  });
  test("offsets for array", () => {
    const value = "[13,14]";
    const tree = parse(value);
    expect(getPointerOffsets("", tree)).toEqual({ offset: 0, length: 7 });
    expect(getPointerOffsets("/", tree)).toEqual({ offset: 0, length: 7 });
    expect(getPointerOffsets("/0", tree)).toEqual({ offset: 1, length: 2 });
    expect(getPointerOffsets("/1", tree)).toEqual({ offset: 4, length: 2 });
    expect(getPointerOffsets("/13", tree)).toEqual(undefined);
  });
  test("offsets for object", () => {
    const value = '{"foo":13}';
    const tree = parse(value);
    expect(getPointerOffsets("", tree)).toEqual({ offset: 0, length: 10 });
    expect(getPointerOffsets("/", tree)).toEqual({ offset: 0, length: 10 });
    expect(getPointerOffsets("/foo", tree)).toEqual({ offset: 7, length: 2 });
    expect(getPointerOffsets("/1", tree)).toEqual(undefined);
    expect(getPointerOffsets("/bar", tree)).toEqual(undefined);
  });
  test("offsets for broken object", () => {
    const value = '{"foo":}';
    const tree = parse(value);
    expect(getPointerOffsets("", tree)).toEqual({ offset: 0, length: 8 });
    expect(getPointerOffsets("/", tree)).toEqual({ offset: 0, length: 8 });
    expect(getPointerOffsets("/foo", tree)).toEqual({ offset: 1, length: 5 });
    expect(getPointerOffsets("/bar", tree)).toEqual(undefined);
  });

  // test("toInstance for empty sub object", () => {
  //   const value = '{"foo":{}}'
  //   const tree = parse(value);
  //   expect(toInstance(doc.root!)).toEqual({ foo: {} });
  // });
});
