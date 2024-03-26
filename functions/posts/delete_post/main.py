import json
import boto3
import urllib.parse
import urllib.request
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
likes_table = dynamodb_resource.Table("tastehub-likes")
posts_table = dynamodb_resource.Table("tastehub-posts")
comments_table = dynamodb_resource.Table("tastehub-comments")
users_table = dynamodb_resource.Table("tastehub-users")

'''
This function deletes a post from the posts table,
removes all rows for the post in the comments table,
removes all rows for the post in the likes table,
and decrements the numberOfPosts attribute in user table
Requires: userEmail (String), postID (String)

Use the following format:

const res = await fetch(
        `https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws?userEmail=${userEmail}&postID=${postID}`,
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
        likes_result = likes_table.query(
            IndexName="idIndex",
            KeyConditionExpression=Key('postID').eq(queryParameters["postID"])
        )

        comments_result = comments_table.query(
            KeyConditionExpression=Key('postID').eq(queryParameters["postID"])
        )

        likes_items = likes_result.get("Items", [])
        comments_items = comments_result.get("Items", [])

        for like_item in likes_items:
            likes_table.delete_item(
                Key={
                    "postID": like_item["postID"],
                    "userEmailOfLiker": like_item["userEmailOfLiker"]
                }
            )

        for comments_item in comments_items:
            comments_table.delete_item(
                Key={
                    "postID": comments_item["postID"],
                    "commentID": comments_item["commentID"]
                }
            )

        posts_table.delete_item(
            Key={
                "userEmail": queryParameters["userEmail"],
                "postID": queryParameters["postID"]
        })

        users_table.update_item(Key={
                "userEmail": queryParameters["userEmail"]
            },
            UpdateExpression="SET numberOfPosts = numberOfPosts + :value",
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