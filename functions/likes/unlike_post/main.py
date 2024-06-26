import json
import boto3

dynamodb_resource = boto3.resource("dynamodb")
likes_table = dynamodb_resource.Table("tastehub-likes")
posts_table = dynamodb_resource.Table("tastehub-posts")
 

'''
This function removes a row from the likes table
and decrements the number of likes for a post in the numberOfLikes column in the posts table.
Requires: userEmailOfLiker (String), postID (String), and userEmailOfPoster (String)

Use the following format:

const res = await fetch(
        `https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?userEmailOfLiker=${userEmailOfLiker}&postID=${postID}&userEmailOfPoster=${userEmailOfPoster}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
        }
    );
'''
def lambda_handler(event, context):
    queryParameters = event["queryStringParameters"]
    try:
        likes_table.delete_item(Key={
            "postID": queryParameters["postID"],
            "userEmailOfLiker": queryParameters["userEmailOfLiker"],
        })

        posts_table.update_item(
            Key={
                "userEmail": queryParameters["userEmailOfPoster"],
                "postID": queryParameters["postID"]
            },
            UpdateExpression="SET numberOfLikes = numberOfLikes + :value",
            ExpressionAttributeValues={":value": -1},
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