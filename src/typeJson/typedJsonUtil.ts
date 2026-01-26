// import { ASTNode, JSONDocument } from "vscode-json-languageservice";
// import { getNodePath } from "vscode-json-languagesefrvice/lib/esm/parser/jsonParser.js";
import { Node, ParseError, parseTree } from 'jsonc-parser';

export interface SuggestPos {
  readonly pointer: string;
  readonly inside: boolean;
  readonly replaceOffset: number;
  readonly replaceLength: number;
}

export type Offsets = {
  readonly offset: number;
  readonly length: number;
};

export function getPointerOffsets(
  pointer: string,
  tree: Node,
): Offsets | undefined {
  if (!tree) {
    return undefined;
  } else if (pointer === "" || pointer === "/") {
    return { offset: tree.offset, length: tree.length };
  } else if (!pointer.startsWith("/")) {
    return undefined;
  } else {
    const path = pointer.split("/").splice(1);
    return getPathOffsets(path, tree);
  }
}

export function parseJson(t: string): Node | undefined {
  const errors: ParseError[] = []
  const result = parseTree(t, errors);
  return errors.length === 0 ? result : undefined;
}
export function parseTolerantJson(t: string): Node | undefined {
  return parseTree(t);
}

export function parseRepairedInstance(t: string): any {
  const tree = parseTolerantJson(t)
  return tree ? toRepairedInstance(tree) : {}
}

function toRepairedInstance(n: Node): any {
  switch (n.type) {
    case "array": {
      return n.children?.map(toRepairedInstance);
    }
    case "object": {
      let o: { [key: string]: any } = {};
      n.children?.forEach((p) => {
        const [keyNode, valueNode] = p.children ?? []
        o[keyNode.value] = valueNode ? toRepairedInstance(valueNode) : null;
      });
      return o;
    }
    case "string": {
      return n.value;
    }
    case "number": {
      return n.value;
    }
    case "boolean": {
      return n.value;
    }
    case "null": {
      return null;
    }
    case "property": {
      throw new Error("boom");
    }
  }
}

function contains(offset: number, n: Node): boolean {
  return n.offset <= offset && offset < n.offset + n.length;
}

function isInside(offset: number, n: Node): boolean {
  return n.offset < offset && offset < n.offset + n.length - 0;
}

function replaceAt(n: Node, pos: SuggestPos): SuggestPos {
  return { ...pos, replaceOffset: n.offset, replaceLength: n.length };
}

function appendPointer(segment: string | number, pos: SuggestPos): SuggestPos {
  const pointer = `${pos.pointer}/${segment}`;
  return { ...pos, pointer };
}
function insidePos(inside: boolean, pos: SuggestPos): SuggestPos {
  return { ...pos, inside };
}

export function getSuggestPosAt(
  offset: number,
  tree: Node,
): SuggestPos | undefined {
  const go = (offset: number, n: Node, pos: SuggestPos) => {
    if (contains(offset, n)) {
      switch (n.type) {
        case "array": {
          const found = findNodeInChildren(offset, n.children ?? []);
          if (found) {
            const [item, i] = found;
            return go(offset, item, appendPointer(i, pos));
          } else {
            const pos1 = insidePos(isInside(offset, n), pos);
            return pos1.inside ? pos1 : replaceAt(n, pos1);
          }
        }
        case "object": {
          const found = findNodeInChildren(offset, n.children ?? []);
          if (found) {
            const [property] = found;
            return go(offset, property, pos);
          } else {
            const pos1 = insidePos(isInside(offset, n), pos);
            return pos1.inside ? pos1 : replaceAt(n, pos1);
          }
        }
        case "property": {
          const [keyNode, valueNode] = n.children ?? []
          if (contains(offset, keyNode)) {
            return replaceAt(keyNode, { ...pos, inside: true });
          } else if (valueNode && contains(offset, valueNode)) {
            return go(offset, valueNode, appendPointer(keyNode.value, pos));
          } else {
            const inside =
              n.colonOffset === undefined ||
              n.colonOffset < 0 ||
              offset <= n.colonOffset;
            const pos1 = inside
              ? replaceAt(keyNode, pos)
              : appendPointer(keyNode.value, pos);
            return insidePos(inside, pos1);
          }
        }
        default: {
          return replaceAt(n, pos);
        }
      }
    }
    return undefined;
  };
  if (tree) {
    const pos: SuggestPos = {
      pointer: "",
      inside: false,
      replaceOffset: offset,
      replaceLength: 0,
    };
    return go(offset, tree, pos);
  }
  return { pointer: "", inside: false, replaceOffset: 0, replaceLength: 0 };
}

function findNodeInChildren(
  offset: number,
  cs: Node[],
): [Node, number] | undefined {
  for (let i = 0; i < cs.length && cs[i].offset <= offset; i++) {
    const found = contains(offset, cs[i]);
    if (found) {
      return [cs[i], i];
    }
  }
  return undefined;
}

function getPathOffsets(
  path: string[],
  n: Node | undefined,
): Offsets | undefined {
  if (n) {
    if (path.length === 0) {
      return { offset: n.offset, length: n.length };
    }
    const [head, ...tail] = path;
    switch (n.type) {
      case "array": {
        const i = Number.parseInt(head);

        const items = n.children as Node[] ?? []
        return getPathOffsets(tail, items[i]);
      }
      case "object": {
        const properties = (n.children?.map(p => p.children) ?? []) as [[Node, Node]]
        const prop = properties.find(([k]) => k.value === head) ?? [];
        const [keyNode, valueNode] = prop;
        const v = valueNode ?? keyNode;
        return getPathOffsets(tail, v);
      }
    }
  }
  return undefined;
}
