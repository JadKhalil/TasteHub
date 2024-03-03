import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
follows_table = dynamodb_resource.Table("tastehub-follows")
users_table = dynamodb_resource.Table("tastehub-users")
 

'''
This function adds a follow relationship to a follows table, and 
increments the numberOfFollowers andnumberOfFollowing for the followee and follower, respectively, in the follows table.
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
        follows_table.put_item(Item={
            "userEmailOfFollower": body["userEmailOfFollower"],
            "userEmailOfFollowee": body["userEmailOfFollowee"]
        })

        users_table.update_item(
            Key={
                "userEmail": body["userEmailOfFollowee"],
            },
            UpdateExpression="SET numberOfFollowers = numberOfFollowers + :value",
            ExpressionAttributeValues={":value": 1},
            ReturnValues="UPDATED_NEW"
        )

        users_table.update_item(
            Key={
                "userEmail": body["userEmailOfFollower"],
            },
            UpdateExpression="SET numberOfFollowing = numberOfFollowing + :value",
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