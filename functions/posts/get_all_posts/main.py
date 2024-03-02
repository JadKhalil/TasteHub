import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
posts_table = dynamodb_resource.Table("tastehub-posts")


'''
This function returns a list of all posts in the application.

Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws",
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        }
    );
'''
def lambda_handler(event, context):
    try:
        result = posts_table.scan()
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "success",
                "postList": result
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