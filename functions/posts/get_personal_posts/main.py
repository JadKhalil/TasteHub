import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb_resource = boto3.resource("dynamodb")
posts_table = dynamodb_resource.Table("tastehub-posts")


# Used to JSON dump data with type Decimal which is not supported by default
class DecimalEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return str(obj)
    return json.JSONEncoder.default(self, obj)
  
'''
This function returns a list of all posts that belongs to a user.
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
        result = posts_table.query(KeyConditionExpression=Key('userEmail').eq(queryParameter["userEmail"]))
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "success",
                "postList": result
                }, cls=DecimalEncoder)
        }
    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message":str(exp)
            })
        }