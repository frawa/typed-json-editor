import {
  editor,
  MarkerSeverity,
} from "monaco-editor/esm/vs/editor/editor.api.js";
import { JSONDocument } from "vscode-json-languageservice";
import { getPointerOffsets } from "./typedJsonUtil";

export type BasicOutput = {
  readonly flag: boolean;
  readonly errors?: readonly BasicError[];
};

export type BasicError = {
  readonly keywordLocation: string;
  readonly instanceLocation: string;
  readonly error: string;
};

export function parseBasicOutput(json: any): BasicOutput {
  // TODO decoding
  return json as BasicOutput;
}

export function basicOutputToMarkers(
  o: BasicOutput,
  model: editor.ITextModel,
  doc: JSONDocument,
): editor.IMarkerData[] {
  return (
    o.errors
      ?.filter((e) => e.error !== "a sub schema failed")
      ?.map(basicErrorToMarker(model, doc))
      .filter((m) => m !== undefined) ?? []
  );
}

function basicErrorToMarker(
  model: editor.ITextModel,
  doc: JSONDocument,
): (error: BasicError) => editor.IMarkerData | undefined {
  return (error) => {
    const offsets = getPointerOffsets(error.instanceLocation, doc);
    if (offsets) {
      const from = model.getPositionAt(offsets.offset);
      const to = model.getPositionAt(offsets.offset + offsets.length);
      const source = error.keywordLocation;
      return {
        severity: MarkerSeverity.Error,
        startLineNumber: from.lineNumber,
        startColumn: from.column,
        endLineNumber: to.lineNumber,
        endColumn: to.column,
        message: error.error,
        source,
        origin: "typed-json",
      };
    }
    return undefined;
  };
}
