import { editor, IDisposable } from "monaco-editor";
//import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

import { FC, useEffect, useRef } from "react";
import styles from "./Editor.module.css";
import "./userWorker";
import { enableTypedJson } from "../typeJson/typedJson";

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

interface EditorProps {
  readonly value: string;
  readonly options?: editor.IEditorOptions;
  readonly onChange?: (value: string) => void;
}

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const subscriptionRef = useRef<IDisposable>(null);
  const onChangeRef = useRef<EditorProps["onChange"]>(null);
  onChangeRef.current = props.onChange;

  // inspired by https://github.com/react-monaco-editor/react-monaco-editor/blob/master/src/editor.tsx
  // and https://github.com/vitejs/vite/discussions/1791

  const { value, options } = props;

  const initMonaco = () => {
    if (containerRef.current) {
      const model = editor.createModel(value, "json");

      const editor1 = editor.create(containerRef.current, {
        model,
        ...defaultOptions,
        ...options,
      });

      subscriptionRef.current = editor1.onDidChangeModelContent(() =>
        onChangeRef.current?.(editor1.getValue()),
      );

      // editor1.setMo;

      editorRef.current = editor1;
    }
  };

  useEffect(initMonaco, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(
    () => () => {
      subscriptionRef.current?.dispose();
      editorRef.current?.dispose();
    },
    [],
  );

  useEffect(() => {
    if (editorRef.current) {
      const typedJson = enableTypedJson(editorRef.current.getModel());
      return () => {
        typedJson.dispose();
      };
    }
  }, []);

  return <div className={styles.Editor} ref={containerRef}></div>;
};
