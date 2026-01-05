# Transcript Testing `typed-json=service`

Run tests using 
``` sh
ucm transcript.fork tests.md
```

``` ucm
typed-json-service/wip> run tests.validateAll @schema1.json @instance1.json
```

``` ucm
typed-json-service/wip> run tests.validateAll @schemaDetailed.json @instanceDetailed.json
```

``` ucm
typed-json-service/wip> run tests.validateAll {} {:}
```

``` ucm
typed-json-service/wip> run tests.validateAll {:} {}
```
