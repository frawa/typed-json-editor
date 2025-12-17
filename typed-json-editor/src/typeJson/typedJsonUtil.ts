import { ASTNode, JSONDocument } from "vscode-json-languageservice";
// import { getNodePath } from "vscode-json-languagesefrvice/lib/esm/parser/jsonParser.js";

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
  doc: JSONDocument,
): Offsets | undefined {
  if (!doc.root) {
    return undefined;
  } else if (pointer === "" || pointer === "/") {
    return { offset: doc.root.offset, length: doc.root.length };
  } else if (!pointer.startsWith("/")) {
    return undefined;
  } else {
    const path = pointer.split("/").splice(1);
    return getPathOffsets(path, doc.root);
  }
}

export function toInstance(n: ASTNode): any {
  switch (n.type) {
    case "array": {
      return n.items.map(toInstance);
    }
    case "object": {
      let o: { [key: string]: any } = {};
      n.properties.forEach((p) => {
        o[p.keyNode.value] = p.valueNode?.value ?? null;
      });
      return o;
    }
    case "property": {
      throw new Error("boom");
    }
    case "string": {
      return JSON.stringify(n.value);
    }
    case "number": {
      return JSON.stringify(n.value);
    }
    case "boolean": {
      return JSON.stringify(n.value);
    }
    case "null": {
      return JSON.stringify(null);
    }
  }
  return {};
}

function contains(offset: number, n: ASTNode): boolean {
  return n.offset <= offset && offset < n.offset + n.length;
}
function isInside(offset: number, n: ASTNode): boolean {
  return n.offset < offset && offset < n.offset + n.length - 1;
}

function replaceAt(n: ASTNode, pos: SuggestPos): SuggestPos {
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
  doc: JSONDocument,
): SuggestPos | undefined {
  const go = (offset: number, n: ASTNode, pos: SuggestPos) => {
    if (contains(offset, n)) {
      switch (n.type) {
        case "array": {
          const found = findNodeInChildren(offset, n.items);
          if (found) {
            const [item, i] = found;
            return go(offset, item, appendPointer(i, pos));
          } else {
            const pos1 = insidePos(isInside(offset, n), pos);
            return pos1.inside ? pos1 : replaceAt(n, pos1);
          }
        }
        case "object": {
          const found = findNodeInChildren(offset, n.properties);
          if (found) {
            const [property] = found;
            return go(offset, property, pos);
          } else {
            const pos1 = insidePos(isInside(offset, n), pos);
            return pos1.inside ? pos1 : replaceAt(n, pos1);
          }
        }
        case "property": {
          if (contains(offset, n.keyNode)) {
            return replaceAt(n.keyNode, { ...pos, inside: true });
          } else if (n.valueNode && contains(offset, n.valueNode)) {
            return go(offset, n.valueNode, appendPointer(n.keyNode.value, pos));
          } else {
            const pos1 = insidePos(isInside(offset, n), pos);
            return pos1.inside ? pos1 : replaceAt(n, pos1);
          }
        }
        default: {
          return replaceAt(n, pos);
        }
      }
    }
    return undefined;
  };
  if (doc.root) {
    const pos: SuggestPos = {
      pointer: "",
      inside: false,
      replaceOffset: offset,
      replaceLength: 0,
    };
    return go(offset, doc.root, pos);
  }
}

function findNodeInChildren(
  offset: number,
  cs: ASTNode[],
): [ASTNode, number] | undefined {
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
  n: ASTNode | undefined,
): Offsets | undefined {
  if (n) {
    if (path.length === 0) {
      return { offset: n.offset, length: n.length };
    }
    const [head, ...tail] = path;
    switch (n.type) {
      case "array": {
        const i = Number.parseInt(head);
        return getPathOffsets(tail, n.items[i]);
      }
      case "object": {
        const prop = n.properties.find((p) => p.keyNode.value === head);
        const v = prop?.valueNode ?? prop?.keyNode;
        return getPathOffsets(tail, v);
      }
    }
  }
  return undefined;
}
