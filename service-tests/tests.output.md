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
  , Json.Object
      [ ("valid", Json.Boolean true)
      , ("keywordLocation", Json.Text "/(ignored \"$schema\")")
      , ("instanceLocation", Json.Text "")
      , ("annotation", Json.Text "(ignored \"$schema\")")
      ]
  , Json.Object
      [ ("valid", Json.Boolean true)
      , ("keywordLocation", Json.Text "/(ignored \"$schema\")")
      , ("instanceLocation", Json.Text "")
      , ("annotation", Json.Text "(ignored \"$schema\")")
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
            ]
        )
      ]
  , Json.Object
      [ ("valid", Json.Boolean false)
      , ( "keywordLocation"
        , Json.Text "/patternProperties/f.*o/type"
        )
      , ("instanceLocation", Json.Text "/fooo")
      , ("error", Json.Text "expected type: integer")
      ]
  , Json.Object
      [ ("valid", Json.Boolean false)
      , ("keywordLocation", Json.Text "/patternProperties")
      , ("instanceLocation", Json.Text "")
      , ( "errors"
        , Json.Array
            [ Json.Object
                [ ("valid", Json.Boolean true)
                , ( "keywordLocation"
                  , Json.Text "/patternProperties/f.*o/type"
                  )
                , ("instanceLocation", Json.Text "/foo")
                ]
            , Json.Object
                [ ("valid", Json.Boolean false)
                , ( "keywordLocation"
                  , Json.Text "/patternProperties/f.*o/type"
                  )
                , ("instanceLocation", Json.Text "/fooo")
                , ("error", Json.Text "expected type: integer")
                ]
            , Json.Object
                [ ("valid", Json.Boolean true)
                , ( "keywordLocation"
                  , Json.Text "/patternProperties/f.*o/type"
                  )
                , ("instanceLocation", Json.Text "/foooo")
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
  , Json.Object
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
  , Json.Object
      [("message", Json.Text "no active session schema")]
  , Json.Object
      [("message", Json.Text "no active session schema")]
  ]
```

``` ucm
typed-json-service/wip> run tests.suggestAll @schema7.json []

  [ ( SuggestPos (Pointer.Pointer [])
    , Json.Array
        [ Json.Object
            [ ("location", Json.Text "/if/type")
            , ("values", Json.Array [Json.Array []])
            ]
        ]
    )
  ]

typed-json-service/wip> run tests.suggestAll @schema7.json [13]

  [ ( SuggestPos (Pointer.Pointer [])
    , Json.Array
        [ Json.Object
            [ ("location", Json.Text "/if/type")
            , ("values", Json.Array [Json.Array []])
            ]
        ]
    )
  , ( SuggestPos (Pointer.Pointer [Index 0])
    , Json.Array
        [ Json.Object
            [ ("location", Json.Text "/then/contains/enum")
            , ( "values"
              , Json.Array [Json.Number "13", Json.Number "42"]
              )
            ]
        ]
    )
  ]

typed-json-service/wip> run tests.suggestAll @schema7.json {"gnu":{"bar":42},"foo":13}

  [ ( SuggestPos (Pointer.Pointer [])
    , Json.Array
        [ Json.Object
            [ ("location", Json.Text "/else/properties")
            , ( "values"
              , Json.Array
                  [ Json.Object
                      [("foo", Json.Null), ("gnu", Json.Null)]
                  ]
              )
            ]
        , Json.Object
            [ ("location", Json.Text "/if/type")
            , ("values", Json.Array [Json.Array []])
            ]
        ]
    )
  , ( SuggestPos (Pointer.Pointer [Token.Name "gnu"])
    , Json.Array
        [ Json.Object
            [ ( "location"
              , Json.Text "/else/properties/gnu/properties"
              )
            , ( "values"
              , Json.Array [Json.Object [("bar", Json.Null)]]
              )
            ]
        ]
    )
  , ( SuggestPos
        (Pointer.Pointer [Token.Name "gnu", Token.Name "bar"])
    , Json.Array
        [ Json.Object
            [ ( "location"
              , Json.Text
                  "/else/properties/gnu/properties/bar/enum"
              )
            , ( "values"
              , Json.Array [Json.Text "gnu1", Json.Text "gnu2"]
              )
            ]
        ]
    )
  , ( SuggestPos (Pointer.Pointer [Token.Name "foo"])
    , Json.Array
        [ Json.Object
            [ ( "location"
              , Json.Text "/else/properties/foo/enum"
              )
            , ( "values"
              , Json.Array [Json.Text "foo1", Json.Text "foo2"]
              )
            ]
        ]
    )
  ]
```

``` ucm
typed-json-service/wip> run tests.suggestAll @schemaPolymorphism.json {}

  [ ( SuggestPos (Pointer.Pointer [])
    , Json.Array
        [ Json.Object
            [ ("location", Json.Text "/type")
            , ("values", Json.Array [Json.Object []])
            ]
        , Json.Object
            [ ("location", Json.Text "/allOf/if/properties")
            , ( "values"
              , Json.Array [Json.Object [("what", Json.Null)]]
              )
            ]
        , Json.Object
            [ ( "location"
              , Json.Text "/allOf/then/$ref/properties"
              )
            , ( "values"
              , Json.Array
                  [ Json.Object
                      [ ("trunkLength", Json.Null)
                      , ("tusk", Json.Null)
                      ]
                  ]
              )
            ]
        , Json.Object
            [ ( "location"
              , Json.Text "/allOf/then/$ref/properties"
              )
            , ( "values"
              , Json.Array [Json.Object [("mane", Json.Null)]]
              )
            ]
        , Json.Object
            [ ( "location"
              , Json.Text
                  "/allOf/then/$ref/allOf/$ref/properties"
              )
            , ( "values"
              , Json.Array
                  [ Json.Object
                      [ ("endangered", Json.Null)
                      , ("name", Json.Null)
                      , ("sound", Json.Null)
                      , ("type", Json.Null)
                      ]
                  ]
              )
            ]
        ]
    )
  ]
```
