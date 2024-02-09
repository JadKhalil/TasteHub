import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
tastehub_follows = dynamodb_resource.Table("tastehub-follows")
tastehub_users = dynamodb_resource.Table("tastehub-users")
 

'''
This function adds a like to a post and increments the number of likes in the posts table.
Requires: userEmailOfFollower (String), userEmailOfFollowee (String)

Use the following format:

const res = await fetch(
        `https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws/?userEmailOfFollower=${userEmailOfFollower}&userEmailOfFollowee=${userEmailOfFollowee}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
'''
def lambda_handler(event, context):
    queryParameters = event["queryStringParameters"]
    try:
        tastehub_follows.delete_item(Item={
            "userEmailOfFollower": queryParameters["userEmailOfFollower"],
            "userEmailOfFollowee": queryParameters["userEmailOfFollowee"]
        })

        tastehub_users.update_item(
            Key={
                "userEmail": queryParameters["userEmailOfFollowee"],
            },
            UpdateExpression="ADD numberOfFollowers :value",
            ExpressionAttributeValues={":value": -1},
            ReturnValues="UPDATED_NEW"
        )

        tastehub_users.update_item(
            Key={
                "userEmail": queryParameters["userEmailOfFollower"],
            },
            UpdateExpression="ADD numberOfFollowing :value",
            ExpressionAttributeValues={":value": -1},
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