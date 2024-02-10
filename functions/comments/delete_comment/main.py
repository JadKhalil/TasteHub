import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
comments_table = dynamodb_resource.Table("tastehub-comments")
posts_table = dynamodb_resource.Table("tastehub-posts")
 

'''
This function deletes a comment on a post and decrements the number of comments in the post table.
Requires: commentID (String), postID(String), and userEmailOfPoster (String)

Use the following format:

const res = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?commentID=${commentID}&postID=${postID}&userEmailOfPoster=${userEmailOfPoster}`",
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
        comments_table.delete_item(Key={
            "postID": queryParameters["postID"],
            "commentID": queryParameters["commentID"],
        })

        posts_table.update_item(
            Key={
                "userEmail": queryParameters["userEmailOfPoster"],
                "postID": queryParameters["postID"]
            },
            UpdateExpression="ADD numberOfComments :value",
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