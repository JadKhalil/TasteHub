import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
posts_table = dynamodb_resource.Table("tastehub-posts")
 

'''
This function creates a new post.
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
                "userEmail": String,
                "postID": String,
                "recipeName": String,
                "imageLink": String (URL),
                "prepTime": Number,
                "postDescription": String,
                "category": String,
                "numberOfLikes": Number,
                "numberOfComments": Number,
                "datePosted": String (example format: "2023-12-29T19:08")
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        posts_table.put_item(Item={
            "userEmail": body["userEmail"],
            "postID": body["postID"],
            "recipeName": body["recipeName"],
            "prepTime": body["prepTime"],
            "imageLink": body["imageLink"],
            "postDescription": body["postDescription"],
            "category": body["category"],
            "numberOfLikes": body["numberOfLikes"],
            "numberOfComments": body["numberOfComments"],
            "datePosted": body["datePosted"]
        })

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