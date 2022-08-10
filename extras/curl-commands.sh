curl --request POST http://localhost:5001/api/v1/spaces --header 'Content-Type: application/json' --data-raw '{ "space": { "title": "test", "description": "ABCD" }}'
Output :
{"result":"SUCCESS","space":"space:cord:4B9Ahyjif9L8UGtoUcGdaS6TbCeMhq9XHAZ6rkmQdPmMtV8K"}

curl --request POST http://localhost:5001/api/v1/schemas \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "space": "space:cord:47KLJTD6q3AJytGELeCR9RynU7Kuny4wc8ACEUmN4tdW3PN3",
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

curl --request POST "http://localhost:5001/api/v1/space:cord:47KLJTD6q3AJytGELeCR9RynU7Kuny4wc8ACEUmN4tdW3PN3/records" \
     --header 'Content-Type: application/json' \
     --data-raw '{
   "space": "space:cord:47KLJTD6q3AJytGELeCR9RynU7Kuny4wc8ACEUmN4tdW3PN3",
   "schema": "schema:cord:56crMNQCQ3jS5pFahocZ9qLBuj5xEwD5saXpsgNhtZMBatSf",
   "title": "Record 1",
   "content": {
     "name": "Test Name 1",
     "email": "example@example.org",
     "gender": "Female"
   }
}'
