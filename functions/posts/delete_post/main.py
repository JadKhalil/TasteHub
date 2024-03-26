import json
import boto3
import urllib.parse
import urllib.request
import cloudinary
import cloudinary.uploader
import cloudinary.api
from boto3.dynamodb.conditions import Key

dynamodb_resource = boto3.resource("dynamodb")
likes_table = dynamodb_resource.Table("tastehub-likes")
posts_table = dynamodb_resource.Table("tastehub-posts")
comments_table = dynamodb_resource.Table("tastehub-comments")
users_table = dynamodb_resource.Table("tastehub-users")

# Initialize AWS SSM client
ssm_client = boto3.client('ssm')

#get ssm keys
response = ssm_client.get_parameters_by_path(
    Path='/tastehub/',
    Recursive=True,
    WithDecryption=True,
)

response = {key["Name"]: key["Value"] for key in response["Parameters"]}

#simple function to get keys from Parameter Store
def get_keys(key_path):
    return response[key_path]


# Initialize Cloudinary configuration with your credentials
cloudinary.config(
    cloud_name="dh28kj5kr",
    api_key="783689415177585",
    api_secret=get_keys("/tastehub/cloudinary-key"),
    secure=True
)


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

def extract_public_id(image_link):
    # Split the URL by '/'
    parts = image_link.split('/')
    
    # Find the index of 'upload/'
    upload_index = parts.index('upload')
    
    # Extract the public ID
    public_id_with_extension = parts[upload_index + 2]
    public_id = public_id_with_extension.split('.')[0]  # Remove the file extension
    
    return public_id
    
def lambda_handler(event, context):
    queryParameters = event["queryStringParameters"]
    try:
        post_response = posts_table.get_item(
            Key={
                "userEmail": queryParameters["userEmail"],
                "postID": queryParameters["postID"]
            }
        )
        if "Item" in post_response:
            # Retrieve the Cloudinary public ID from the post
            
            cloudinary_url = post_response["Item"].get("imageLink")
            cloudinary_public_id = extract_public_id(cloudinary_url)

            
            if cloudinary_public_id:
                # Delete the image from Cloudinary
                image_delete_result = cloudinary.api.delete_resources([cloudinary_public_id], resource_type="image", type="upload")
            
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
                        "message": "success",
                        "url": cloudinary_public_id
                    })
            }
        else:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "Post not found"})
            }
    except Exception as exp:
        print(f"exception: {exp}")
        return {
            "statusCode": 500,
                "body": json.dumps({
                    "message":str(exp)
            })
        }
