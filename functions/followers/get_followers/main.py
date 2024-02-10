import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
follows_table = dynamodb_resource.Table("tastehub-follows")


'''
This function returns a list of all user emails that follows an individual.
Requires: userEmail (String).

Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?userEmail=${userEmail}`",
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
        result = follows_table.query(
            IndexName="followeeIndex",
            KeyConditionExpression=Key('userEmailOfFollowee').eq(queryParameter["userEmail"]))
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "success",
                "commentList": result
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