import React, { useState } from "react";
import "./App.css";
import { Editor } from "./components/Editor";
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
            onChange={updatedInstance}
            options={{ theme: "vs-dark" }}
          />
        </div>
      </div>
      <div className="column">
        <h1>Schema Editor</h1>
        <div className="monaco-container" id="editorSchema">
          <Editor
            value={schema}
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
          <option value="if-then-else">If/Then/Else</option>
          <option value="all-of">All Of</option>
          <option value="test-schema-6">not/not</option>
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

const sampleSchemas = {
  properties: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    properties: {
      foo: { type: "array", maxItems: 3 },
      bar: { type: "array" },
    },
    patternProperties: { "f.o": { minItems: 2 } },
    additionalProperties: { type: "integer" },
  },
  "if-then-else": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    then: { const: "yes" },
    else: { const: "other" },
    if: { maxLength: 4 },
  },
  "all-of": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    properties: { bar: { type: "integer" } },
    required: ["bar"],
    allOf: [
      {
        properties: {
          foo: { type: "string" },
        },
        required: ["foo"],
      },
      {
        properties: {
          baz: { type: "null" },
        },
        required: ["baz"],
      },
    ],
  },
  "test-schema-6": {
    properties: {
      foo: {
        not: {
          not: {
            const: 666,
          },
        },
        oneOf: [
          {
            enum: [13, 42],
          },
        ],
      },
      bar: {
        items: {
          default: 1313,
        },
      },
    },
  },
};

function toJsonString(v: any): string {
  return JSON.stringify(v, null, 2);
}
