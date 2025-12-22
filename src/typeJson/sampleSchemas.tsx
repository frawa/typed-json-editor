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
};
