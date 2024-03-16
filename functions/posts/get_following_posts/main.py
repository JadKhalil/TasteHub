import json
import boto3
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr
from decimal import Decimal


dynamodb_resource = boto3.resource("dynamodb")
follows_table = dynamodb_resource.Table("tastehub-follows")
posts_table = dynamodb_resource.Table("tastehub-posts")

# Used to JSON dump data with type Decimal which is not supported by default
class DecimalEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return str(obj)
    return json.JSONEncoder.default(self, obj)

'''
This function returns a list of posts from all followed users
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
    try:
        # 1. Get the userEmail from query string parameters
        queryParameter = event["queryStringParameters"]
        userEmail = queryParameter["userEmail"]

        # 2. Get a list of users the current user is following
        following_response = follows_table.query(
            KeyConditionExpression=Key('userEmailOfFollower').eq(userEmail)
        )
        following_emails = [item["userEmailOfFollowee"] for item in following_response["Items"]]

        # 3. If no following users, return empty list
        if not following_emails:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "message": "success",
                    "postList": {
                       "Items": []
                    },
                }, cls=DecimalEncoder)
            }

        # 4. Construct a filter expression to query for posts from following users
        filter_expression = Attr('userEmail').is_in(following_emails)


        # 5. Query the posts table with the filter expression
        response = posts_table.scan(FilterExpression=filter_expression)

        # 6. Return the list of posts from following users
        return {
            "statusCode": 200,
            "body": json.dumps({
                "message": "success",
                "postList": response,
            }, cls=DecimalEncoder)
        }

    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
            "body": json.dumps({
                "message": str(exp),
            })
        }