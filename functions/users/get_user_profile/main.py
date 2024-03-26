from boto3.dynamodb.conditions import Key
from decimal import Decimal
import boto3
import json

dynamodb_resource = boto3.resource("dynamodb")
users_table = dynamodb_resource.Table("tastehub-users")

# Used to JSON dump data with type Decimal which is not supported by default
class DecimalEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Decimal):
      return str(obj)
    return json.JSONEncoder.default(self, obj)
  
'''
This function returns a user profile for one user
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
        # Get userEmail from the query string parameters
        userEmail = event["queryStringParameters"]["userEmail"]

        # Use KeyConditionExpression to query for the user
        response = users_table.query(
            KeyConditionExpression=Key('userEmail').eq(userEmail)
        )

        # Check if user exists
        if not response["Items"]:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "User not found"})
            }

        # Return the user profile information
        return {
            "statusCode": 200,
            "body": json.dumps({
               "message": "success",
                "userInfo": response
                }, cls=DecimalEncoder)
        }

    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(exp)})
        }
