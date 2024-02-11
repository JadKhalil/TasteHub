##Copied create_comment code to use as boilerplate

from requests_toolbelt.multipart import decoder
import json
import boto3
import requests
import time
import hashlib
import base64
import os


dynamodb_resource = boto3.resource("dynamodb")
users_table = dynamodb_resource.Table("tastehub-users")
 

'''
This function creates a new user adding the info into the Tastehub-users table.
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
                "profilePictureLink": String,
                "bio": String,
                "Username": String,
                "numOfFollowers": Int,
                "numOfFollowing": Int
            })
        }
    );
'''
def lambda_handler(event, context):
    body = json.loads(event["body"])
    try:
        users_table.put_item(Item={
            "userEmail": body["userEmail"],
            "profilePictureLink": body["profilePictureLink"],
            "bio": body["bio"],
            "Username": body["Username"],
            "numOfFollowers": body["numOfFollowers"],
            "numOfFollowing": body["numOfFollowing"]
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

##Cloudinary functionality
    
client = boto3.client('ssm')

#get ssm keys
response = client.get_parameters_by_path(
    Path='/tastehub/',
    Recursive=True,
    WithDecryption=True,
)

response = {key["Name"]: key["Value"] for key in response["Parameters"]}

#simple function to get keys from Parameter Store
def get_keys(key_path):
    return response[key_path]


#function to upload file to cloudinary
'''
We will call upload_to_cloud() and we will store the result in 'res' if we wish to get the 
url for the image that needs to be put into DynamoDB we can use: res["secure_url"]
'''

def upload_to_cloud(filename, resource_type='image'):
    api_key = "535718123262293" #Jacob's = 535718123262293, Eddie's = 
    cloud_name = "drua7mqfb" #Jacob's = drua7mqfb, Eddie's = 
    api_secret = get_keys("/tastehub/cloudinary-key")
    timestamp = int(time.time())

    body = {
        "api_key" : api_key,
        "timestamp" : timestamp
    }

    files = {
        "file" : open(filename, "rb")
    }

    body["signature"] = create_signature(body, api_secret)

    url = f"http://api.cloudinary.com/v1_1/{cloud_name}/{resource_type}/upload/"

    res = requests.post(url, files=files, data=body)
    
    return res.json()

#generate signature for cloudinary
def create_signature(body, api_secret):
    exclude = ["api_key", "resource_type", "cloud_name"]

    sorted_body = sort_dict(body, exclude)
    query_str = create_query_string(sorted_body)
    query_str_appended = f"{query_str}{api_secret}"

    hashed = hashlib.sha1(query_str_appended.encode())
    signature = hashed.hexdigest()

    return signature

#simple dictionary sorter in alphabetical order
def sort_dict(dictionary, exclude):
    return {k: v for k,v in sorted(dictionary.items(), key=lambda item: item[0]) if k not in exclude}

def create_query_string(body):
    query_string = ""

    for idx, (k, v) in enumerate(body.items()):
        query_string = f"{k}={v}" if idx == 0 else f"{query_string}&{k}={v}"

    return query_string