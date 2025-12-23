import React, { useState } from "react";
import "./App.css";
import { Editor } from "./components/Editor";
import { apiSuggestion, apiSuggestSchema } from "./typeJson/apiClient";
import { sampleSchemas } from "./typeJson/sampleSchemas";
import { updatedInstance, updatedSchema } from "./typeJson/typedJson";

export function App(): React.ReactElement {
  const [value, setValue] = useState(toJsonString(initialValue));
  const [schema, setSchema] = useState(toJsonString(initialSchema));
  const [schemaId, setSchemaId] = useState(0);

  const setSampleSchema = (id: string) => {
    const s = (sampleSchemas as any)[id] ?? initialSchema;
    setSchema(toJsonString(s));
  };

  return (
    <div className="page">
      <div className="header" />
      <div className="content">
        <div className="column">
          <h1>Json Editor</h1>
          <div className="monaco-container" id="editor">
            <Editor
              value={value}
              schemaId={schemaId}
              getSuggestions={apiSuggestion}
              onChange={(e) => {
                setValue(e.getValue());
                updatedInstance(e);
              }}
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
              onChange={(e) => {
                setSchema(e.getValue());
                updatedSchema(e).then((valid) => {
                  if (valid) {
                    setSchemaId(schemaId + 1);
                  }
                });
              }}
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
            <option value="discriminated-union">
              Discriminated Union Type
            </option>
            <option value="if-then-else">Mini If/Then/Else</option>
            <option value="all-of">All Of</option>
            <option value="test-schema-4">not</option>
            <option value="test-schema-6">not/not</option>
            <option value="test-schema-7">if/then/else</option>
          </select>
        </div>
      </div>
      <div className="footer">
        Powered by{" "}
        <a href="https://share.unison-lang.org/@frawa/typed-json">
          <code>@frawa/typed-json</code>
        </a>
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
