import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
tastehub_follows = dynamodb_resource.Table("tastehub-follows")
tastehub_users = dynamodb_resource.Table("tastehub-users")
 

'''
This function adds a like to a post and increments the number of likes in the posts table.
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
                "userEmailOfFollower": String,
                "userEmailOfFollowee": String
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        tastehub_follows.put_item(Item={
            "userEmailOfFollower": body["userEmailOfFollower"],
            "userEmailOfFollowee": body["userEmailOfFollowee"]
        })

        tastehub_users.update_item(
            Key={
                "userEmail": body["userEmailOfFollowee"],
            },
            UpdateExpression="ADD numberOfFollowers :value",
            ExpressionAttributeValues={":value": 1},
            ReturnValues="UPDATED_NEW"
        )

        tastehub_users.update_item(
            Key={
                "userEmail": body["userEmailOfFollower"],
            },
            UpdateExpression="ADD numberOfFollowing :value",
            ExpressionAttributeValues={":value": 1},
            ReturnValues="UPDATED_NEW"
        )

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