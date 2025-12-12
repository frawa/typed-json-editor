import * as monaco from "monaco-editor";
//import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { FC, useEffect, useRef } from "react";
import styles from "./Editor.module.css";
import "./userWorker";

import "monaco-editor/esm/vs/editor/browser/coreCommands.js";
import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/comment/browser/comment.js";
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController.js";
import "monaco-editor/esm/vs/editor/contrib/hover/browser/getHover.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/smartSelect/browser/smartSelect.js";
import "monaco-editor/esm/vs/editor/contrib/suggest/browser/suggestController.js";
import "monaco-editor/esm/vs/editor/contrib/wordHighlighter/browser/wordHighlighter.js";
import "monaco-editor/esm/vs/editor/contrib/wordOperations/browser/wordOperations.js";
import { enableTypedJson } from "./typedJson";

interface EditorProps {
  readonly value: string;
  readonly options?: monaco.editor.IEditorOptions;
  readonly onChange?: (value: string) => void;
}

const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  // automaticLayout: false,
  minimap: {
    enabled: false,
  },
  bracketPairColorization: {
    enabled: true,
  },
  suggest: {
    preview: true,
    previewMode: "subwordSmart",
  },
  //theme: "vs-dark",
  theme: "vs",
  formatOnType: true,
  glyphMargin: false,
  lightbulb: {
    // enabled: On,
  },
  "semanticHighlighting.enabled": true,
};

export const Editor: FC<EditorProps> = (props: EditorProps) => {
  const containerElement = useRef<HTMLDivElement | null>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const subscription = useRef<monaco.IDisposable>(null);
  const onChangeRef = useRef<EditorProps["onChange"]>(null);
  onChangeRef.current = props.onChange;

  // inspired by https://github.com/react-monaco-editor/react-monaco-editor/blob/master/src/editor.tsx
  // and https://github.com/vitejs/vite/discussions/1791

  const { value, options } = props;

  const initMonaco = () => {
    if (containerElement.current) {
      const model = monaco.editor.createModel(value, "json");

      const editor1 = monaco.editor.create(containerElement.current, {
        model,
        ...defaultOptions,
        ...options,
      });

      subscription.current = editor1.onDidChangeModelContent(() =>
        onChangeRef.current?.(editor1.getValue()),
      );

      editor.current = editor1;
    }
  };

  useEffect(initMonaco, []);

  useEffect(() => {
    if (editor.current && editor.current.getValue() !== value) {
      editor.current.setValue(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      subscription.current?.dispose();
      editor.current?.dispose();
    },
    [],
  );

  useEffect(() => {
    if (editor.current) {
      const typedJson = enableTypedJson(editor.current.getModel());
      return () => {
        typedJson.dispose();
      };
    }
  }, []);

  return <div className={styles.Editor} ref={containerElement}></div>;
};
