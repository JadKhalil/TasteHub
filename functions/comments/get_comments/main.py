import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
comments_table = dynamodb_resource.Table("tastehub-comments")


'''
Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?postID=${postID}`",
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
        result = comments_table.query(KeyConditionExpression=Key('postID').eq(queryParameter["postID"]))
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