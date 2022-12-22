
curl --request POST http://localhost:5001/api/v1/schemas \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "schema": {
       "$schema": "http://json-schema.org/draft-07/schema#",
       "title": "test12341",
       "description": "Test Description",
       "type": "object",
       "properties": {
         "name": { "type": "string"},
         "email": { "type": "string" },
         "gender": { "type": "string"}
       }
    }
}' && echo

# {"result":"SUCCESS","schema":"schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf"}

curl --request POST http://localhost:5001/api/v1/spaces --header 'Content-Type: application/json' \
     --data-raw '{ "schema": "schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf",
      "space": { "title": "test12341", "description": "ABCD" }
}' && echo

#Output :
#{"result":"SUCCESS","space":"space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K"}


read && curl --request POST "http://localhost:5001/api/v1/space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K/records" \
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
}' && echo

# Output:
# {"result":"SUCCESS","stream":{"identifier":"6Ad3dC1HCTVVvZ5ZRSY5VCmy2v9HG3YqxszVedBcRZNixLaT","streamHash":"0xc5d778546952d0d493e29a536669698fd76f9717d0ad6c6935dab5feb06ae967","issuer":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","holder":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","schema":"56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf","link":null,"space":"4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K","signatureProof":{"keyId":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","signature":"0x01a0b73259855067edddd733bcae523665d71fdb57dbf51a30eb0de984b2cad508a51658b28c98f8d2b57393eb65a1ffb973abbafd075c0bc622c87914d7cc7d8a"}}}

## Sample for Record Update
## Note the PUT request (not POST), also send previous Identifier in the call
read && curl --request PUT "http://localhost:5001/api/v1/4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K/records/6Ad3dC1HCTVVvZ5ZRSY5VCmy2v9HG3YqxszVedBcRZNixLaT" \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "title": "Record 1",
   "content": {
     "name": "TEST TEST ----",
     "email": "example@example.org",
     "gender": "Female"
   }
}' && echo


curl --request POST "http://localhost:5001/api/v1/verify" \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "vc":{"@context":["https://www.w3.org/2018/credentials/v1","https://cord.network/contexts/credentials"],"id":"cred:cord:66do5EZ2PHP5C9ZM9tuYFT7npm6m2tLcZTmez4iz98uvPD8p","type":["VerifiableCredential","CordCredential2020"],"issuer":"id:cord:3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","issuanceDate":"2022-12-18T18:24:43.539Z","expirationDate":"2121-12-18T18:24:43.539Z","credentialSubject":{"@id":"id:cord:3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi","@context":{"@vocab":"schema:cord:59wCNQVySZ8ST86JUxB78HR74NNFzTHqWKPvZHvtwMXQ4WDn#"},"name":"Test Name 2","email":"example@example.org","gender":"Male"},"credentialHash":"hash:cord:0x1578cc78392b58f1aff9e35a8e29f6e1a5009d6209a1c28b8ad6634505a7955d","evidence":[],"nonTransferable":true,"proof":[{"type":"CordStreamSignature2020","proofPurpose":"assertionMethod","verificationMethod":{"type":"Sr25519VerificationKey2020","publicKeyHex":"0x8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"},"signature":"0x01ccbe1480dc604a00ad99697b6036d5a5f26335e28c0d54e19205c1d6bdb0251eeac77a2ec3cd9a5619b970b55f0c680d6f6dda223e239bae86fa6c89e6b7cdf"},{"type":"CordCredential2020","proofPurpose":"assertionMethod","issuerAddress":"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi"},{"type":"CordCredentialDigest2020","proofPurpose":"assertionMethod","nonces":{"0x48caa3b311ebb13935f328a58182b597eb06e3ba6dfb93f45349d173d7b303f7":"ccebb970-a650-426f-abf6-34cece858303","0x8da2b5b461ca1682f1664c32cdaf6e77cceb01e20b1ff76518b21319e3e5e00c":"4584e479-0fd6-4cc9-bbc8-55dbc424f073","0x1b697d7c96f50084cec508e0a1b46973939302d68fde3ee7d73b9e5dd66d303b":"2fc6b409-8fb9-4ee1-8f9e-d183951b1df7","0xb1d6909adf1257e9d047d745b3b28d5f5513a098b009d580c4025d004dcacd4d":"ecd32a3a-3716-4fec-b3da-5b6892eb04a2"},"contentHashes":["0x2b22da2c8ed0e956e1cb9accad321bf3ac1b151c8eb2013cbaa6acdad39c4acd","0x957e99896ab5f8b8a533998bbc90257f44f0024289b7c50d7067deee67eb613d","0x9aaa542958ab1202c9af706eb6839005b9e45820ff1019e30ba6556f4b6c07a0","0xc4f294682b8331780d18d6cf6b2417de32b6a83afb6d98b19024e41e1f19aa6a"]}],"credentialSchema":{"@id":"schema:cord:59wCNQVySZ8ST86JUxB78HR74NNFzTHqWKPvZHvtwMXQ4WDn","@type":"JsonSchemaValidator2018","name":"test12341","schema":{"$schema":"http://json-schema.org/draft-07/schema#","title":"test12341","description":"Test Description","type":"object","properties":{"name":{"type":"string"},"email":{"type":"string"},"gender":{"type":"string"}},"$id":"schema:cord:59wCNQVySZ8ST86JUxB78HR74NNFzTHqWKPvZHvtwMXQ4WDn"},"author":"id:cord:3x4DH1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi"}}}' && echo

