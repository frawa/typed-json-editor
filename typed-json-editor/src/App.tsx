import React from "react";
import "./App.css";
import { Editor } from "./components/Editor";

export function App(): React.ReactElement {
  return (
    <div className="page">
      <div className="column">
        <h1>Json Editor</h1>
        <div className="monaco-container" id="editor">
          <Editor />
        </div>
      </div>
      <div className="column">
        <h1>Schema Editor</h1>
        <div className="monaco-container" id="editorSchema">
          <Editor />
        </div>
        <label htmlFor="sample-schema">Try one of these:</label>
        <select name="sample-schema" id="sample-schema">
          <option value=""></option>
          <option value="properties">Properties</option>
          <option value="if-then-else">If/Then/Else</option>
          <option value="all-of">All Of</option>
        </select>
      </div>
    </div>
  );
}
