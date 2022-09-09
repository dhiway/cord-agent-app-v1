import requests

#schema
def create_new_schema():
    url = "http://localhost:5001/api/v1/schemas"
    payload = {
        "schema": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "test-shivansh-new-3",
            "description": "Test Description",
            "type": "object",
            "properties": {
                    "name": { "type": "string"},
                    "email": { "type": "string" },
                    "gender": { "type": "string"}
                }
            }
        }
    
    response = requests.request("POST", url, json=payload)
    print(response.json())

    '''
    {
        "result": "SUCCESS",
        "schema": "schema:cord:57eeFhxzZVfwUmfWSz5TSgZB5AZnhCx5eECQ9XgWENpGEVR4"
    }
    '''

def fetch_schema_by_identity():
    url = "http://localhost:5001/api/v1/schemas/schema:cord:57eeFhxzZVfwUmfWSz5TSgZB5AZnhCx5eECQ9XgWENpGEVR4"
    response = requests.request("GET", url)
    print(response.json())
    '''
    {
        "id": "01a80dbf-e5f5-497a-9a7a-859935f5b714",
        "title": "test-shivansh-new-3",
        "identity": "57eeFhxzZVfwUmfWSz5TSgZB5AZnhCx5eECQ9XgWENpGEVR4",
        "revoked": true,
        "content": "{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"test-shivansh-new-3\",\"description\":\"Test Description\",\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"gender\":{\"type\":\"string\"}}}",
        "cordSchema": "{\"identifier\":\"schema:cord:57eeFhxzZVfwUmfWSz5TSgZB5AZnhCx5eECQ9XgWENpGEVR4\",\"schemaHash\":\"0x3cb50c65603eb348044c88f90210ee13542495fbf1d5cb0cc505408818e89df4\",\"schema\":{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"test-shivansh-new-3\",\"description\":\"Test Description\",\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"gender\":{\"type\":\"string\"}},\"$id\":\"schema:cord:57eeFhxzZVfwUmfWSz5TSgZB5AZnhCx5eECQ9XgWENpGEVR4\"},\"controller\":\"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi\",\"controllerSignature\":\"0x0138b44eb5bcf4772fc10bc737474eb6f75dfc738732a12e9d408fd59c6d116c090cfe55ea4b4aef7ff9eabb9ddf304bf1da7b3f9930e735125aede1482ca8f78a\"}",
        "cordBlock": "0x72316c8871986b4b7425c9bba36c707ec17f220b5cedc0f33cf0e70f512a72cb",
        "createdAt": "2022-09-09T12:31:37.025Z"
    }
    '''

def fetch_all_schemas():
    url = "http://localhost:5001/api/v1/schemas"
    response = requests.request("GET", url)
    print(response.json())
    '''
    [
        {
            "id": "5640b018-3894-4a35-80d1-17c003314c3c",
            "title": "test-shivansh",
            "identity": "595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X",
            "revoked": true,
            "content": "{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"test-shivansh\",\"description\":\"Test Description\",\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"gender\":{\"type\":\"string\"}}}",
            "cordSchema": "{\"identifier\":\"schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X\",\"schemaHash\":\"0x7bbda454ac0f60d31177a67fc9504f73c9b421d77d49e58a8e279e7b295969c3\",\"schema\":{\"$schema\":\"http://json-schema.org/draft-07/schema#\",\"title\":\"test-shivansh\",\"description\":\"Test Description\",\"type\":\"object\",\"properties\":{\"name\":{\"type\":\"string\"},\"email\":{\"type\":\"string\"},\"gender\":{\"type\":\"string\"}},\"$id\":\"schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X\"},\"controller\":\"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi\",\"controllerSignature\":\"0x01468e88c1e5e6a70ef099d5b8c22da8501177f4c2f7c043d7ec9c0a8a9e5145341b996c8fc640166c1105d9abd30e465fd865172e8ae1dc5cfb2327a4cefe9b81\"}",
            "cordBlock": "0x6a1b354cc41524babe47a011db8c774301e1edf95c24310104ba61507eea04c0",
            "createdAt": "2022-09-09T10:23:13.111Z"
        }
    ]
    '''

def revoke_schema():
    url = "http://localhost:5001/api/v1/schemas/schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X/revoke"
    response = requests.request("POST", url)
    print(response.json())
    '''
    {
        "result": "SUCCESS",
        "record": "schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X",
        "block": "0x301234b590230d2cd06a16e87a9b036e68b2f0fe8ec8ebeee63f65a18b4a92d1"
    }
    '''

#space
def create_space():
    url = "http://localhost:5001/api/v1/spaces"
    payload = {
        "schema": "schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X",
        "space": {
            "title": "test-shivansh-3",
            "description": "Some Description"
        }
    }
    response = requests.request("POST", url, json=payload)
    print(response.json())
    '''
    {
        "result": "SUCCESS",
        "space": "space:cord:47phMdxzBSL3FofzD6jwJp7FfAnhMow4oHNCjYY31fieE8fv"
    }
    '''

def fetch_all_space():
    url = "http://localhost:5001/api/v1/spaces"
    response = requests.request("GET", url)
    print(response.json())
    '''
    [
        {
            "id": "1d0c25c1-41e9-4db0-9b88-9011a3bfe4ce",
            "title": "test-shivansh",
            "identity": "47ubdXYWFRu73zXamtsMcWqQJRAwqQi9Uz7BX5WTwTSxVCM3",
            "content": "{\"title\":\"test-shivansh\",\"description\":\"Some Description\"}",
            "cordSpace": "{\"identifier\":\"space:cord:47ubdXYWFRu73zXamtsMcWqQJRAwqQi9Uz7BX5WTwTSxVCM3\",\"spaceHash\":\"0x42775b547376a30c22ae808a515fba9d1aba5eba02d6df2836890bdf72a4016a\",\"details\":{\"title\":\"test-shivansh\",\"description\":\"Some Description\"},\"schema\":\"595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X\",\"controller\":\"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi\",\"controllerSignature\":\"0x0194f4ac29bf646ce94cb3633bbb5fc8da7017eba46612d59249f8d85cf47c3f7b9b5f152f3d7e6b941ccd2b64af5d07c43a61bf1d47d305154d8a60d824bd7c8e\"}",
            "cordBlock": "0x83086f2214458bf9864e0422697d459379a9ebf633785e2b0076f795edf3f2df",
            "schema": "schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X",
            "createdAt": "2022-09-09T11:00:06.860Z"
        }
    ]
    '''

def fetch_space_by_identity():
    url = "http://localhost:5001/api/v1/spaces/47phMdxzBSL3FofzD6jwJp7FfAnhMow4oHNCjYY31fieE8fv"
    response = requests.request("GET", url)
    print(response.json())
    '''
    {
        "id": "3c87a033-9d64-49ef-b4f0-bcc6f781592a",
        "title": "test-shivansh-3",
        "identity": "47phMdxzBSL3FofzD6jwJp7FfAnhMow4oHNCjYY31fieE8fv",
        "content": "{\"title\":\"test-shivansh-3\",\"description\":\"Some Description\"}",
        "cordSpace": "{\"identifier\":\"space:cord:47phMdxzBSL3FofzD6jwJp7FfAnhMow4oHNCjYY31fieE8fv\",\"spaceHash\":\"0x3eba67c39359aa2669c8d1deab409e56afe061d80ae1e558448fcf3f338f47dc\",\"details\":{\"title\":\"test-shivansh-3\",\"description\":\"Some Description\"},\"schema\":\"595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X\",\"controller\":\"3x4DHc1rxVAEqKWSx1DAAA8wZxLB4VhiRbMV997niBckUwSi\",\"controllerSignature\":\"0x01348d6b63c329e5af12242b14fce4953646c6bad9833484dec8be16c7cfb335580425f49fdb224e31bc63ed7125c703cae45c0d389a7ef6f4d83a11c9caa2ec81\"}",
        "cordBlock": "0x773558c8543bd91612d2e41abf9e130963e8a7e5565abdd5146cd5b66ef2b1dc",
        "schema": "schema:cord:595HpjtdExcKsce5dzaKTRwNBRoKbp6Xzs9udzbhC4WVXs2X",
        "createdAt": "2022-09-09T12:32:25.011Z"
    }
    '''
