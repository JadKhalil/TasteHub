##Copied create_comment code to use as boilerplate

import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
users_table = dynamodb_resource.Table("tastehub-users")
 

'''
This function creates a new user adding the info into the Tastehub-users table.
Requires a JSON object as specified below.

Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws/",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "userEmail": String,
                "profilePictureLink": String,
                "bio": String,
                "Username": String,
                "numOfFollowers": Int,
                "numOfFollowing": Int
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        users_table.put_item(Item={
            "userEmail": body["userEmail"],
            "profilePictureLink": body["profilePictureLink"],
            "bio": body["bio"],
            "Username": body["Username"],
            "numOfFollowers": body["numOfFollowers"],
            "numOfFollowing": body["numOfFollowing"]
        })

        return {
            "statusCode": 200,
                "body": json.dumps({
                    "message": "success"
                })
        }
    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message":str(exp)
            })
        }