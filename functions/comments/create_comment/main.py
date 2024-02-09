import json
import boto3


dynamodb_resource = boto3.resource("dynamodb")
comments_table = dynamodb_resource.Table("tastehub-comments")
posts_table = dynamodb_resource.Table("tastehub-posts")
 

'''
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
                "commentID": String,
                "userEmailOfCommenter": String,
                "content": String,
                "userEmailOfPoster": String
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        comments_table.put_item(Item={
            "postID": body["postID"],
            "commentID": body["commentID"],
            "userEmailOfCommenter": body["userEmailOfCommenter"],
            "content": body["content"]
        })

        posts_table.update_item(
            Key={
                "userEmail": body["userEmailOfPoster"],
                "postID": body["postID"]
            },
            UpdateExpression="ADD numberOfComments :value",
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