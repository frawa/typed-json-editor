import React, { useState } from "react";
import "./App.css";
import { Editor } from "./components/Editor";
import { apiSuggestion, apiSuggestSchema } from "./typeJson/apiClient";
import { sampleSchemas } from "./typeJson/sampleSchemas";
import { updatedInstance, updatedSchema } from "./typeJson/typedJson";

export function App(): React.ReactElement {
  const [value] = useState(toJsonString(initialValue));
  const [schema, setSchema] = useState(toJsonString(initialSchema));

  const setSampleSchema = (id: string) => {
    const s = (sampleSchemas as any)[id] ?? initialSchema;
    setSchema(toJsonString(s));
  };

  return (
    <div className="page">
      <div className="column">
        <h1>Json Editor</h1>
        <div className="monaco-container" id="editor">
          <Editor
            value={value}
            getSuggestions={apiSuggestion}
            onChange={updatedInstance}
            options={{ theme: "vs" }}
          />
        </div>
      </div>
      <div className="column">
        <h1>Schema Editor</h1>
        <div className="monaco-container" id="editorSchema">
          <Editor
            value={schema}
            getSuggestions={apiSuggestSchema}
            onChange={updatedSchema}
            options={{ theme: "vs" }}
          />
        </div>
        <label htmlFor="sample-schema">Try one of these:</label>
        <select
          name="sample-schema"
          id="sample-schema"
          onChange={(e) => setSampleSchema(e.target.value)}
        >
          <option value=""></option>
          <option value="properties">Properties</option>
          <option value="discriminated-union">Discriminated Untion Type</option>
          <option value="if-then-else">Mini If/Then/Else</option>
          <option value="all-of">All Of</option>
          <option value="test-schema-4">not</option>
          <option value="test-schema-6">not/not</option>
          <option value="test-schema-7">if/then/else</option>
        </select>
      </div>
    </div>
  );
}

const initialValue = {
  hello: "world",
};

const initialSchema = {
  type: "boolean",
};

function toJsonString(v: any): string {
  return JSON.stringify(v, null, 2);
}
