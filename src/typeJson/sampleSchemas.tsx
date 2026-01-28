export const sampleSchemas = {
  properties: {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    properties: {
      foo: { type: "array", maxItems: 3 },
      bar: { type: "array" },
    },
    patternProperties: { "f.o": { minItems: 2 } },
    additionalProperties: { type: "integer" },
  },
  "discriminated-union": {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    properties: {
      tag: {
        type: "string",
        enum: ["circle", "square"],
      },
    },
    required: ["tag"],
    oneOf: [
      {
        properties: {
          tag: { const: "circle" },
          radius: {
            type: "number",
          },
        },
        additionalProperties: false,
      },
      {
        properties: {
          tag: { const: "square" },
          size: { type: "number" },
        },
        additionalProperties: false,
      },
    ],
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
  "test-schema-4": {
    properties: {
      foo: {
        not: {
          const: 666,
        },
        oneOf: [
          {
            enum: [13, 42],
          },
        ],
      },
    },
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
  "test-schema-7": {
    if: {
      type: "array",
    },
    then: {
      contains: {
        enum: [13, 42],
      },
    },
    else: {
      properties: {
        foo: {
          enum: ["foo1", "foo2"],
        },

        gnu: {
          properties: {
            bar: {
              enum: ["gnu1", "gnu2"],
            },
          },
        },
      },
    },
  },
  "test-schema-8": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "http://schema.animal.Animal",
    "type": "object",
    "allOf": [
      {
        "if": {
          "properties": {
            "what": {
              "type": "string",
              "const": "schema.animal.Lion"
            }
          }
        },
        "then": {
          "$ref": "#/$defs/schema.animal.Lion"
        }
      },
      {
        "if": {
          "properties": {
            "what": {
              "type": "string",
              "const": "schema.animal.Elephant"
            }
          }
        },
        "then": {
          "$ref": "#/$defs/schema.animal.Elephant"
        }
      }
    ],
    "$defs": {
      "schema.animal.Animal": {
        "properties": {
          "name": {
            "type": [
              "string",
              "null"
            ]
          },
          "sound": {
            "type": [
              "string",
              "null"
            ]
          },
          "type": {
            "type": [
              "string",
              "null"
            ]
          },
          "endangered": {
            "type": "boolean"
          }
        }
      },
      "schema.animal.Lion": {
        "allOf": [
          {
            "$ref": "#/$defs/schema.animal.Animal"
          }
        ],
        "properties": {
          "mane": {
            "type": "boolean"
          }
        }
      },
      "schema.animal.Elephant": {
        "allOf": [
          {
            "$ref": "#/$defs/schema.animal.Animal"
          }
        ],
        "properties": {
          "trunkLength": {
            "type": "number",
            "format": "double"
          },
          "tusk": {
            "type": "boolean"
          }
        }
      }
    }
  },
  "array-items": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "prefixItems": [
      {
        "enum": [
          13,
          14
        ]
      },
      {
        "enum": [
          "foo",
          "bar"
        ]
      }
    ],
    "items": {
      "enum": [
        42,
        43
      ]
    }
  }
};
