from boto3.dynamodb.conditions import Key

import boto3
import json

dynamodb_resource = boto3.resource("dynamodb")
users_table = dynamodb_resource.Table("tastehub-users")

'''
Documentation yet to be completed
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

        # Extract user data from the response
        user_data = response["Items"][0]

        # Return the user profile information
        return {
            "statusCode": 200,
            "body": json.dumps(user_data)
        }

    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(exp)})
        }
