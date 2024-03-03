import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
likes_table = dynamodb_resource.Table("tastehub-likes")


'''
This function returns a list of postIDs of all liked posts from the likes table.
Useful for seeing a collection of liked posts
Requires: userEmailOfLiker (String).

Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${userEmailOfLiker}`",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }
    );
'''
def lambda_handler(event, context):

    queryParameter = event["queryStringParameters"]
    try:
        result = likes_table.query(KeyConditionExpression=Key('userEmailOfLiker').eq(queryParameter["userEmailOfLiker"]))
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "success",
                "likeList": result
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