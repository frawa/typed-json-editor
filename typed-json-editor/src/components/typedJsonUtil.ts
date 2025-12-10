import { ASTNode, JSONDocument } from "vscode-json-languageservice";
import { getNodePath } from "vscode-json-languageservice/lib/esm/parser/jsonParser.js";


export function getPathAt(offset: number, doc: JSONDocument): string {
  // original, used to define green tests
  // const node = doc.getNodeFromOffset(offset)
  const node = clientGetNodeFromOffset(offset, doc.root)
  if (node) {
    // original, used to define green tests
    // const path = getNodePath(node);
    const path = clientGetNodePath(node);
    return "/" + path.join("/");
  } else {
    return ""
  }
}

// need to re-implement doc.getNodeFromOffset,
// 'cause the client-side objects are different from the worker-side.

function clientGetNodeFromOffset(offset: number, n: ASTNode | undefined): ASTNode | undefined {
  if (n) {
    if (n.offset <= offset && offset < n.offset + n.length) {
      switch (n.type) {
        case "array": {
          return findNodeInChildren(offset, n.items) ?? n
        }
        case "object": {
          return findNodeInChildren(offset, n.properties) ?? n
        }
        case "property": {
          const cs = n.valueNode ? [n.keyNode, n.valueNode] : [n.keyNode]
          return findNodeInChildren(offset, cs) ?? n
        }
        default: {
          return n;
        }
      }
    }
  }
  return undefined;
}

function findNodeInChildren(offset: number, cs: ASTNode[]): ASTNode | undefined {
  for (let i = 0; i < cs.length && cs[i].offset <= offset; i++) {
    const found = clientGetNodeFromOffset(offset, cs[i]);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function clientGetNodePath(n: ASTNode): (string | number)[] {
  if (n.parent) {
    return prependPath(n.parent, n, [])
  }
  return []
}

function prependPath(parent: ASTNode, node: ASTNode, path: (string | number)[]): (string | number)[] {
  switch (parent.type) {
    case "array": {
      const i = parent.items.indexOf(node);
      const path1 = [i, ...path]
      return parent.parent ? prependPath(parent.parent, parent, path1) : path1;
    }
    case 'property': {
      // TODO need key vs value?
      // parent.keyNode === node 
      const path1 = [parent.keyNode.value, ...path]
      return parent.parent ? prependPath(parent.parent, parent, path1) : path1;
    }
    default: {
      return parent.parent ? prependPath(parent.parent, parent, path) : path;
    }
  }
}