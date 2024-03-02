from requests_toolbelt.multipart import decoder
import json
import boto3
import requests
import time
import hashlib
import base64
import os


dynamodb_resource = boto3.resource("dynamodb")
users_table = dynamodb_resource.Table("tastehub-posts")
client = boto3.client('ssm')

'''
This function creates a new post adding the info into the Tastehub-posts table.
The body of the POST request must be in a binary format using FormData().
The elements in FormData must be appended in the following order:
1. userEmail (String)
2. postID (Unique)
3. category (String)
4. datePosted (String)
5. contentImage (image)
6. numberOfLikes (Number)
7. numberOfComments (Number)
8. postDescription (String)
9. prepTime (Number)
10. recipeName (String)
    const promise = await fetch(
        "https://insertSomeLambdaFunctionURL.lambda-url.ca-central-1.on.aws/",
        {
            method: "POST",
            body: formData,
        }
    );
'''
def lambda_handler(event, context):
    body = event["body"]

    if event["isBase64Encoded"]:
        body = base64.b64decode(body)


    content_type = event["headers"]["content-type"]
    data = decoder.MultipartDecoder(body, content_type)
    
    binary_data = [part.content for part in data.parts]
    userEmail = binary_data[0].decode()
    postID = binary_data[1].decode()
    category = binary_data[2].decode()
    datePosted = binary_data[3].decode()
    numberOfLikes = int(binary_data[5].decode('utf-8'))
    numberOfComments = int(binary_data[6].decode('utf-8'))
    postDescription = binary_data[7].decode()
    prepTime = int(binary_data[8].decode('utf-8'))
    recipeName = binary_data[9].decode()

    image = "contentImage.png"
    imageFile = os.path.join("/tmp", image)
    with open(imageFile, "wb") as file:
        file.write(binary_data[4])
    
    cloudImage = upload_to_cloud(imageFile)
    
    try:
        users_table.put_item(Item={'userEmail': userEmail,
                            'postID': postID,
                            'category': category,
                            'datePosted': datePosted,
                            'numberOfLikes': numberOfLikes,
                            'numberOfComments' : numberOfComments,
                            'postDescription': postDescription,
                            'prepTime': prepTime,
                            'recipeName':recipeName,
                            'imageLink': cloudImage["secure_url"]
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
    api_key = "783689415177585" #Jacob's = 535718123262293, Eddie's = 783689415177585
    cloud_name = "dh28kj5kr" #Jacob's = drua7mqfb, Eddie's = dh28kj5kr
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
    query_string = ""
    for idx, (k, v) in enumerate(sorted_body.items()):
        query_string = f"{k}={v}" if idx == 0 else f"{query_string}&{k}={v}"
    query_str_appended = f"{query_string}{api_secret}"

    hashed = hashlib.sha1(query_str_appended.encode())
    signature = hashed.hexdigest()

    return signature

#simple dictionary sorter in alphabetical order
def sort_dict(dictionary, exclude):
    return {k: v for k,v in sorted(dictionary.items(), key=lambda item: item[0]) if k not in exclude}
