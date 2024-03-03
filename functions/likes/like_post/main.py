import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
likes_table = dynamodb_resource.Table("tastehub-likes")
posts_table = dynamodb_resource.Table("tastehub-posts")
 

'''
This function adds a row to the likes table
and increments the number of likes for a post in the numberOfLikes column in the posts table.
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
                "postID": String,
                "userEmailOfLiker": String,
                "userEmailOfPoster": String
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        likes_table.put_item(Item={
            "postID": body["postID"],
            "userEmailOfLiker": body["userEmailOfLiker"]
        })

        posts_table.update_item(
            Key={
                "userEmail": body["userEmailOfPoster"],
                "postID": body["postID"]
            },
            UpdateExpression="SET numberOfLikes = numberOfLikes + :value",
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