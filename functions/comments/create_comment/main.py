import json
import boto3
import urllib.parse
import urllib.request


dynamodb_resource = boto3.resource("dynamodb")
comments_table = dynamodb_resource.Table("tastehub-comments")
posts_table = dynamodb_resource.Table("tastehub-posts")
 
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        comments_table.put_item(Item=body)
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