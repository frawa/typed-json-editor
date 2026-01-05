# typed-json-service

# ucm transcript testing
#ucm transcript.fork tests.md

# Requires
#ucm run 'typed-json-service/wip:.deploy.dev' &

base=http://localhost:8080/s/typed-json/api

curl -c cookies -X PUT -d '{"schema":false}' $base/schema
curl -b cookies -X POST -d '{}' $base/api/validate
curl -b cookies -X POST -d '{}' $base/api/validate?output=basic | jq

curl -c cookies -X PUT -d @schema1.json $base/schema
curl -b cookies -X POST -d @instance1.json $base/validate
curl -b cookies -X POST -d @instance1.json $base/validate?output=basic | jq
curl -b cookies -X POST -d @instance1.json $base/validate?output=detailed | jq

curl -c cookies -X PUT -d @schemaDetailed.json $base/schema
curl -b cookies -X POST -d @instanceDetailed.json $base/validate
curl -b cookies -X POST -d @instanceDetailed.json $base/validate?output=basic | jq
curl -b cookies -X POST -d @instanceDetailed.json $base/validate?output=detailed | jq

# Broken requests

curl -c cookies -X PUT -d '{"schema":}' $base/schema
curl -b cookies -X POST -d '{}' $base/validate
curl -b cookies -X POST -d '{}' $base/validate?output=basic | jq
curl -b cookies -X POST -d '{}' $base/validate?output=detailed | jq

# Suggest

curl -c cookies -X PUT -d @schema7.json $base/schema
curl -b cookies -X POST -d @suggest7_8.json $base/api/suggest | jq
