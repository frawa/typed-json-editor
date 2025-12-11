import { ASTNode, JSONDocument } from "vscode-json-languageservice";
// import { getNodePath } from "vscode-json-languagesefrvice/lib/esm/parser/jsonParser.js";

export interface SuggestPos {
  readonly pointer: string;
  readonly inside: boolean;
  readonly replaceOffset: number;
  readonly replaceLength: number;
}

export function getSuggestPosAt(
  offset: number,
  doc: JSONDocument,
): SuggestPos | undefined {
  // original, used to define green tests
  // const node = doc.getNodeFromOffset(offset)
  const node = clientGetNodeFromOffset(offset, doc.root);
  if (node) {
    // original, used to define green tests
    // const path = getNodePath(node);
    const { path, inside } = getPathPos(node, offset);
    const pointer = "/" + path.join("/");
    return {
      pointer,
      inside,
      replaceOffset: node.offset,
      replaceLength: node.length,
    };
  } else {
    return undefined;
  }
}

// need to re-implement doc.getNodeFromOffset,
// 'cause the client-side objects are different from the worker-side.

function clientGetNodeFromOffset(
  offset: number,
  n: ASTNode | undefined,
): ASTNode | undefined {
  if (n) {
    if (n.offset <= offset && offset < n.offset + n.length) {
      switch (n.type) {
        case "array": {
          return findNodeInChildren(offset, n.items) ?? n;
        }
        case "object": {
          return findNodeInChildren(offset, n.properties) ?? n;
        }
        case "property": {
          const cs = n.valueNode ? [n.keyNode, n.valueNode] : [n.keyNode];
          return findNodeInChildren(offset, cs) ?? n;
        }
        default: {
          return n;
        }
      }
    }
  }
  return undefined;
}

function findNodeInChildren(
  offset: number,
  cs: ASTNode[],
): ASTNode | undefined {
  for (let i = 0; i < cs.length && cs[i].offset <= offset; i++) {
    const found = clientGetNodeFromOffset(offset, cs[i]);
    if (found) {
      return found;
    }
  }
  return undefined;
}

type PathPos = { path: (string | number)[]; inside: boolean };

function getPathPos(n: ASTNode, offset: number): PathPos {
  const inside =
    (n.type === "array" || n.type === "property") &&
    n.offset < offset &&
    offset < n.offset + n.length - 1;
  const pos = { path: [], inside };
  return n.parent ? prependPath(n.parent, n, pos) : pos;
}

function prependPath(parent: ASTNode, node: ASTNode, pos: PathPos): PathPos {
  switch (parent.type) {
    case "array": {
      const i = parent.items.indexOf(node);
      const pos1 = { ...pos, path: [i, ...pos.path] };
      return parent.parent ? prependPath(parent.parent, parent, pos1) : pos1;
    }
    case "property": {
      const inside = parent.keyNode === node || pos.inside;
      const pos1 = { path: [parent.keyNode.value, ...pos.path], inside };
      return parent.parent ? prependPath(parent.parent, parent, pos1) : pos1;
    }
    default: {
      return parent.parent ? prependPath(parent.parent, parent, pos) : pos;
    }
  }
}
