
curl --request POST http://localhost:5001/api/v1/schemas \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "schema": {
       "$schema": "http://json-schema.org/draft-07/schema#",
       "title": "test",
       "description": "Test Description",
       "type": "object",
       "properties": {
         "name": { "type": "string"},
         "email": { "type": "string" },
         "gender": { "type": "string"}
       }
    }
}'

{"result":"SUCCESS","schema":"schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf"}

curl --request POST http://localhost:5001/api/v1/spaces --header 'Content-Type: application/json' \
     --data-raw '{ "schema": "schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf",
      "space": { "title": "test", "description": "ABCD" }
}'

Output :
{"result":"SUCCESS","space":"space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K"}


curl --request POST "http://localhost:5001/api/v1/space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K/records" \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "space": "space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K",
   "schema": "schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf",
   "title": "Record 1",
   "content": {
     "name": "Test Name 1",
     "email": "example@example.org",
     "gender": "Female"
   }
}'

Output:
{"result":"SUCCESS","stream":{"identifier":"6Ad3dC1HCTVVvZ5ZRSY5VCmy2v9HG3YqxszVedBcRZNixLaT","streamHash":"0xc5d778546952d0d493e29a536669698fd76f9717d0ad6c6935dab5feb06ae967","issuer":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","holder":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","schema":"56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf","link":null,"space":"4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K","signatureProof":{"keyId":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","signature":"0x01a0b73259855067edddd733bcae523665d71fdb57dbf51a30eb0de984b2cad508a51658b28c98f8d2b57393eb65a1ffb973abbafd075c0bc622c87914d7cc7d8a"}}}
