# Transcript Testing `typed-json=service`

Run tests using

``` sh
ucm transcript.fork tests.md
```

``` ucm
typed-json-service/wip> run tests.validateAll @schema1.json @instance1.json

  [ Json.Boolean true
  , Json.Object
      [ ("valid", Json.Boolean true)
      , ( "annotations"
        , Json.Array
            [ Json.Object
                [ ( "keywordLocation"
                  , Json.Text "/(ignored \"$schema\")"
                  )
                , ("instanceLocation", Json.Text "")
                , ("value", Json.Text "(ignored \"$schema\")")
                ]
            , Json.Object
                [ ("keywordLocation", Json.Text "/properties")
                , ("instanceLocation", Json.Text "")
                , ("value", Json.Array [Json.Text "foo2"])
                ]
            , Json.Object
                [ ( "keywordLocation"
                  , Json.Text
                      "/dependentSchemas/foo2/properties"
                  )
                , ("instanceLocation", Json.Text "")
                , ("value", Json.Array [])
                ]
            ]
        )
      ]
  ]
```

``` ucm
typed-json-service/wip> run tests.validateAll @schemaDetailed.json @instanceDetailed.json

  [ Json.Boolean false
  , Json.Object
      [ ("valid", Json.Boolean false)
      , ( "errors"
        , Json.Array
            [ Json.Object
                [ ( "keywordLocation"
                  , Json.Text "/patternProperties/f.*o/type"
                  )
                , ("instanceLocation", Json.Text "/fooo")
                , ("error", Json.Text "expected type: integer")
                ]
            , Json.Object
                [ ( "keywordLocation"
                  , Json.Text "/patternProperties/f.*o"
                  )
                , ("instanceLocation", Json.Text "/fooo")
                , ("error", Json.Text "a sub schema failed")
                ]
            , Json.Object
                [ ( "keywordLocation"
                  , Json.Text "/patternProperties"
                  )
                , ("instanceLocation", Json.Text "")
                , ("error", Json.Text "a sub schema failed")
                ]
            , Json.Object
                [ ( "keywordLocation"
                  , Json.Text "/patternProperties"
                  )
                , ("instanceLocation", Json.Text "")
                , ("error", Json.Text "a sub schema failed")
                ]
            , Json.Object
                [ ("keywordLocation", Json.Text "")
                , ("instanceLocation", Json.Text "")
                , ("error", Json.Text "a sub schema failed")
                ]
            ]
        )
      ]
  ]
```

``` ucm
typed-json-service/wip> run tests.validateAll {} {:}

  [ Json.Object
      [ ( "message"
        , Json.Text
            "JSON document failed to parse: ParseError.ParseError\n  \"expected text literal\" 1 \":}\""
        )
      ]
  , Json.Object
      [ ( "message"
        , Json.Text
            "JSON document failed to parse: ParseError.ParseError\n  \"expected text literal\" 1 \":}\""
        )
      ]
  ]
```

``` ucm
typed-json-service/wip> run tests.validateAll {:} {}

  [ Json.Object
      [("message", Json.Text "no active session schema")]
  , Json.Object
      [("message", Json.Text "no active session schema")]
  ]
```
