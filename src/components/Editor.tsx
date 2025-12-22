import { editor, IDisposable } from "monaco-editor";
//import {} from "monaco-editor/esm/vs/editor/editor.api";

import { FC, useEffect, useRef } from "react";
import styles from "./Editor.module.css";
import "./userWorker";
import { enableTypedJson, GetSuggestionsFun } from "../typeJson/typedJson";

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
  readonly getSuggestions: GetSuggestionsFun;
  readonly onChange: (editor: editor.IStandaloneCodeEditor) => void;
  readonly options?: editor.IStandaloneEditorConstructionOptions;
}

const defaultOptions: editor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  // wordWrap: "on",
  // autoDetectHighContrast: false,
  minimap: {
    enabled: false,
  },
  bracketPairColorization: {
    enabled: true,
  },
  suggest: {
    filterGraceful: false,
    preview: true,
    previewMode: "prefix", //"subwordSmart",
    matchOnWordStartOnly: false,
  },
  theme: "vs-dark",
  // theme: "vs",
  // theme: "vs",
  formatOnType: true,
  glyphMargin: false,
  lightbulb: {
    // enabled: ShowLightbulbIconMode.On,
  },
  // "semanticHighlighting.enabled": true,
};

export const Editor: FC<EditorProps> = (props: EditorProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const subscriptionRef = useRef<IDisposable>(null);
  const onChangeRef = useRef<EditorProps["onChange"]>(null);
  onChangeRef.current = props.onChange;

  // inspired by https://github.com/react-monaco-editor/react-monaco-editor/blob/master/src/editor.tsx
  // and https://github.com/vitejs/vite/discussions/1791

  const { value, getSuggestions, options } = props;

  const initMonaco = () => {
    if (containerRef.current) {
      const model = editor.createModel(value, "json");

      const editor1 = editor.create(containerRef.current, {
        ...options,
        ...defaultOptions,
        model,
      });

      subscriptionRef.current = editor1.onDidChangeModelContent(() =>
        onChangeRef.current?.(editor1),
      );

      editorRef.current = editor1;
    }
  };

  useEffect(initMonaco, []);

  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== value) {
      editorRef.current.setValue(value);
      onChangeRef.current?.(editorRef.current)
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
      const typedJson = enableTypedJson(
        editorRef.current.getModel(),
        getSuggestions,
      );
      return () => {
        typedJson.dispose();
      };
    }
  }, []);

  return <div className={styles.Editor} ref={containerRef}></div>;
};
