terraform {
  required_providers {
    aws = {
      version = ">= 4.0.0"
      source  = "hashicorp/aws"
    }
  }
}

# specify the provider region
provider "aws" {
  region = "ca-central-1"
}

# locals block to declare constants
locals {
  handler_name         = "main.lambda_handler"
  artifact_name        = "artifact.zip"
}

# create a role for the Lambda function to assume
# every service on AWS that wants to call other AWS services should first assume a role and
# then any policy attached to the role will give permissions
# to the service so it can interact with other AWS services
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role
resource "aws_iam_role" "lambda" {
  name               = "iam-for-tastehub-lambda"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "parameter_store" {
  name        = "tastehub-parameter-store"
  description = "IAM policy for ssm key fetch and decryption from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "ssm:GetParametersByPath",
        "kms:Decrypt"
      ],
      "Resource": [
        "arn:aws:ssm:ca-central-1:228775797536:parameter/tastehub/",
        "arn:aws:kms:ca-central-1:228775797536:key/c531aee2-2247-4d3c-bd1a-1330532571cc"
        ],
      "Effect": "Allow"
    }
  ]
}
EOF
}

# create a policy for publishing logs to CloudWatch
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_policy
resource "aws_iam_policy" "logs" {
  name        = "tastehub-lambda-logging"
  description = "IAM policy for logging from a lambda"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:Scan"
      ],
      "Resource": ["arn:aws:logs:*:*:*", 
                  "${aws_dynamodb_table.tastehub-users.arn}",
                  "${aws_dynamodb_table.tastehub-posts.arn}",
                  "${aws_dynamodb_table.tastehub-likes.arn}",
                  "${aws_dynamodb_table.tastehub-comments.arn}",
                  "${aws_dynamodb_table.tastehub-follows.arn}",
                  "${aws_dynamodb_table.tastehub-likes.arn}/index/*",
                  "${aws_dynamodb_table.tastehub-follows.arn}/index/*"],
      "Effect": "Allow"
    }
  ]
}
EOF
}

# attach the above policy to the function role
# see the docs: https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy_attachment
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.logs.arn
}

resource "aws_iam_role_policy_attachment" "lambda_parameter_store" {
  role       = aws_iam_role.lambda.name
  policy_arn = aws_iam_policy.parameter_store.arn
}

/* 
 Configuring 5 Database Tables in DynamoDB
*/

# Users table
resource "aws_dynamodb_table" "tastehub-users" {
  name         = "tastehub-users"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # partition key (hash_key) is userEmail
  hash_key  = "userEmail"

  # the hash_key data type is string
  attribute {
    name = "userEmail"
    type = "S"
  }
}

# Posts table
resource "aws_dynamodb_table" "tastehub-posts" {
  name         = "tastehub-posts"

  billing_mode = "PROVISIONED"
  read_capacity = 1
  write_capacity = 1

  # partition key is userEmail
  hash_key  = "userEmail"

  # sort key is postID
  range_key = "postID"

  # the hash_key data type is string
  attribute {
    name = "userEmail"
    type = "S"
  }

  # the range_key data type is string
  attribute {
    name = "postID"
    type = "S"
  }
}

# Likes table
resource "aws_dynamodb_table" "tastehub-likes" {
  name         = "tastehub-likes"

  billing_mode = "PROVISIONED"
  read_capacity = 1
  write_capacity = 1

  # partition key is userEmailOfLiker
  hash_key  = "userEmailOfLiker"

  # sort key is postID
  range_key = "postID"

  # the hash_key data type is string
  attribute {
    name = "userEmailOfLiker"
    type = "S"
  }

# the range_key data type is string
  attribute {
    name = "postID"
    type = "S"
  }

  global_secondary_index {
    name               = "idIndex"
    hash_key           = "postID"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "KEYS_ONLY"
  }
}

# Likes table
resource "aws_dynamodb_table" "tastehub-comments" {
  name         = "tastehub-comments"
  billing_mode = "PROVISIONED"

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # partition key is postID
  hash_key  = "postID"

  # sort key is commentID
  range_key = "commentID"

  # the hash_key data type is string
  attribute {
    name = "postID"
    type = "S"
  }

# the range_key data type is string
  attribute {
    name = "commentID"
    type = "S"
  }
}

# Likes table
resource "aws_dynamodb_table" "tastehub-follows" {
  name         = "tastehub-follows"

  billing_mode = "PROVISIONED"
  read_capacity = 1
  write_capacity = 1

  hash_key  = "userEmailOfFollower"
  range_key = "userEmailOfFollowee"

  # the hash_key data type is string
  attribute {
    name = "userEmailOfFollower"
    type = "S"
  }

# the range_key data type is string
  attribute {
    name = "userEmailOfFollowee"
    type = "S"
  }

# Secondary index is defined to allow for more flexible queries
  global_secondary_index {
    name               = "followeeIndex"
    hash_key           = "userEmailOfFollowee"
    write_capacity     = 1
    read_capacity      = 1
    projection_type    = "KEYS_ONLY"
  }
}

/* 
 Creating archive file for all lambda functions
*/

# creating archive file for create_post
data "archive_file" "create_post" {
  type        = "zip"
  source_dir = "../functions/posts/create_post"
  output_path = "../functions/posts/create_post/${local.artifact_name}"
}

# creating archive file for get_all_posts
data "archive_file" "get_all_posts" {
  type        = "zip"
  source_dir = "../functions/posts/get_all_posts"
  output_path = "../functions/posts/get_all_posts/${local.artifact_name}"
}

# creating archive file for get_personal_posts
data "archive_file" "get_personal_posts" {
  type        = "zip"
  source_dir = "../functions/posts/get_personal_posts"
  output_path = "../functions/posts/get_personal_posts/${local.artifact_name}"
}

# creating archive file for delete_post
data "archive_file" "delete_post" {
  type        = "zip"
  source_dir = "../functions/posts/delete_post"
  output_path = "../functions/posts/delete_post/${local.artifact_name}"
}

# creating archive file for create_comment
data "archive_file" "create_comment" {
  type        = "zip"
  source_dir = "../functions/comments/create_comment"
  output_path = "../functions/comments/create_comment/${local.artifact_name}"
}

# creating archive file for delete_comment
data "archive_file" "delete_comment" {
  type        = "zip"
  source_dir = "../functions/comments/delete_comment"
  output_path = "../functions/comments/delete_comment/${local.artifact_name}"
}

# creating archive file for get_comments_on_post
data "archive_file" "get_comments_on_post" {
  type        = "zip"
  source_dir = "../functions/comments/get_comments_on_post"
  output_path = "../functions/comments/get_comments_on_post/${local.artifact_name}"
}

# creating archive file for like_post
data "archive_file" "like_post" {
  type        = "zip"
  source_dir = "../functions/likes/like_post"
  output_path = "../functions/likes/like_post/${local.artifact_name}"
}

# creating archive file for unlike_post
data "archive_file" "unlike_post" {
  type        = "zip"
  source_dir = "../functions/likes/unlike_post"
  output_path = "../functions/likes/unlike_post/${local.artifact_name}"
}

# creating archive file for get_users_liked_posts
data "archive_file" "get_users_liked_posts" {
  type        = "zip"
  source_dir = "../functions/likes/get_users_liked_posts"
  output_path = "../functions/likes/get_users_liked_posts/${local.artifact_name}"
}

# creating archive file for get_likes_on_post
data "archive_file" "get_likes_on_post" {
  type        = "zip"
  source_dir = "../functions/likes/get_likes_on_post"
  output_path = "../functions/likes/get_likes_on_post/${local.artifact_name}"
}

# creating archive file for follow_user
data "archive_file" "follow_user" {
  type        = "zip"
  source_dir = "../functions/followers/follow_user"
  output_path = "../functions/followers/follow_user/${local.artifact_name}"
}

# creating archive file for unfollow_user
data "archive_file" "unfollow_user" {
  type        = "zip"
  source_dir = "../functions/followers/unfollow_user"
  output_path = "../functions/followers/unfollow_user/${local.artifact_name}"
}

# creating archive file for get_following
data "archive_file" "get_following" {
  type        = "zip"
  source_dir = "../functions/followers/get_following"
  output_path = "../functions/followers/get_following/${local.artifact_name}"
}

# creating archive file for get_following_posts
data "archive_file" "get_following_posts" {
  type = "zip"
  source_dir = "../functions/posts/get_following_posts"
  output_path = "../functions/posts/get_following_posts/${local.artifact_name}"
}

# creating archive file for get_followers
data "archive_file" "get_followers" {
  type        = "zip"
  source_dir = "../functions/followers/get_followers"
  output_path = "../functions/followers/get_followers/${local.artifact_name}"
}

# creating archive file for create_user_profile
data "archive_file" "create_user_profile" {
  type        = "zip"
  source_dir = "../functions/users/create_user_profile"
  output_path = "../functions/users/create_user_profile/${local.artifact_name}"
}

# creating archive file for get_user_profile
data "archive_file" "get_user_profile" {
  type        = "zip"
  source_dir = "../functions/users/get_user_profile"
  output_path = "../functions/users/get_user_profile/${local.artifact_name}"
}

# create a Lambda function for create_post
resource "aws_lambda_function" "lambda_create_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-create-post"
  handler          = local.handler_name
  filename         = "../functions/posts/create_post/${local.artifact_name}"
  source_code_hash = data.archive_file.create_post.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_following_posts
resource "aws_lambda_function" "lambda_get_following_posts" {
  role = aws_iam_role.lambda.arn
  function_name = "tastehub-get-following-posts"
  handler = local.handler_name
  filename = "../functions/posts/get_following_posts/${local.artifact_name}"
  source_code_hash = data.archive_file.get_following_posts.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_all_posts
resource "aws_lambda_function" "lambda_get_all_posts" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-all-posts"
  handler          = local.handler_name
  filename         = "../functions/posts/get_all_posts/${local.artifact_name}"
  source_code_hash = data.archive_file.get_all_posts.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_personal_posts
resource "aws_lambda_function" "lambda_get_personal_posts" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-personal-posts"
  handler          = local.handler_name
  filename         = "../functions/posts/get_personal_posts/${local.artifact_name}"
  source_code_hash = data.archive_file.get_personal_posts.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for delete_post
resource "aws_lambda_function" "lambda_delete_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-delete-post"
  handler          = local.handler_name
  filename         = "../functions/posts/delete_post/${local.artifact_name}"
  source_code_hash = data.archive_file.delete_post.output_base64sha256
  runtime = "python3.9"
}


# create a Lambda function for create_comment
resource "aws_lambda_function" "lambda_create_comment" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-create-comment"
  handler          = local.handler_name
  filename         = "../functions/comments/create_comment/${local.artifact_name}"
  source_code_hash = data.archive_file.create_comment.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for delete_comment
resource "aws_lambda_function" "lambda_delete_comment" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-delete-comment"
  handler          = local.handler_name
  filename         = "../functions/comments/delete_comment/${local.artifact_name}"
  source_code_hash = data.archive_file.delete_comment.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_comments_on_post
resource "aws_lambda_function" "lambda_get_comments_on_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-comments-on-post"
  handler          = local.handler_name
  filename         = "../functions/comments/get_comments_on_post/${local.artifact_name}"
  source_code_hash = data.archive_file.get_comments_on_post.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for like_post
resource "aws_lambda_function" "lambda_like_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-like-post"
  handler          = local.handler_name
  filename         = "../functions/likes/like_post/${local.artifact_name}"
  source_code_hash = data.archive_file.like_post.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for unlike_post
resource "aws_lambda_function" "lambda_unlike_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-unlike-post"
  handler          = local.handler_name
  filename         = "../functions/likes/unlike_post/${local.artifact_name}"
  source_code_hash = data.archive_file.unlike_post.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_users_liked_posts
resource "aws_lambda_function" "lambda_get_users_liked_posts" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-users-liked-posts"
  handler          = local.handler_name
  filename         = "../functions/likes/get_users_liked_posts/${local.artifact_name}"
  source_code_hash = data.archive_file.get_users_liked_posts.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_likes_on_post
resource "aws_lambda_function" "lambda_get_likes_on_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-likes-on-post"
  handler          = local.handler_name
  filename         = "../functions/likes/get_likes_on_post/${local.artifact_name}"
  source_code_hash = data.archive_file.get_likes_on_post.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for follow_user
resource "aws_lambda_function" "lambda_follow_user" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-follow-user"
  handler          = local.handler_name
  filename         = "../functions/followers/follow_user/${local.artifact_name}"
  source_code_hash = data.archive_file.follow_user.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for unfollow_user
resource "aws_lambda_function" "lambda_unfollow_user" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-unfollow-user"
  handler          = local.handler_name
  filename         = "../functions/followers/unfollow_user/${local.artifact_name}"
  source_code_hash = data.archive_file.unfollow_user.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_following
resource "aws_lambda_function" "lambda_get_following" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-following"
  handler          = local.handler_name
  filename         = "../functions/followers/get_following/${local.artifact_name}"
  source_code_hash = data.archive_file.get_following.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_followers
resource "aws_lambda_function" "lambda_get_followers" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-followers"
  handler          = local.handler_name
  filename         = "../functions/followers/get_followers/${local.artifact_name}"
  source_code_hash = data.archive_file.get_followers.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for create_user_profile
resource "aws_lambda_function" "lambda_create_user_profile" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-create-user-profile"
  handler          = local.handler_name
  filename         = "../functions/users/create_user_profile/${local.artifact_name}"
  source_code_hash = data.archive_file.create_user_profile.output_base64sha256
  runtime = "python3.9"
}

# create a Lambda function for get_user_profile
resource "aws_lambda_function" "lambda_get_user_profile" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-get-user-profile"
  handler          = local.handler_name
  filename         = "../functions/users/get_user_profile/${local.artifact_name}"
  source_code_hash = data.archive_file.get_user_profile.output_base64sha256
  runtime = "python3.9"
}

/*
  Creating URLs for all Lambda functions
 */

# create a Function URL for Lambda create_post
resource "aws_lambda_function_url" "url_create_post" {
  function_name      = aws_lambda_function.lambda_create_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_all_posts
resource "aws_lambda_function_url" "url_get_all_posts" {
  function_name      = aws_lambda_function.lambda_get_all_posts.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_personal_posts
resource "aws_lambda_function_url" "url_get_personal_posts" {
  function_name      = aws_lambda_function.lambda_get_personal_posts.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda delete_post
resource "aws_lambda_function_url" "url_delete_post" {
  function_name      = aws_lambda_function.lambda_delete_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda create_comment
resource "aws_lambda_function_url" "url_create_comment" {
  function_name      = aws_lambda_function.lambda_create_comment.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda delete_comment
resource "aws_lambda_function_url" "url_delete_comment" {
  function_name      = aws_lambda_function.lambda_delete_comment.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_comments_on_post
resource "aws_lambda_function_url" "url_get_comments_on_post" {
  function_name      = aws_lambda_function.lambda_get_comments_on_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda like_post
resource "aws_lambda_function_url" "url_like_post" {
  function_name      = aws_lambda_function.lambda_like_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda unlike_post
resource "aws_lambda_function_url" "url_unlike_post" {
  function_name      = aws_lambda_function.lambda_unlike_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_users_liked_posts
resource "aws_lambda_function_url" "url_get_users_liked_posts" {
  function_name      = aws_lambda_function.lambda_get_users_liked_posts.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_likes_on_post
resource "aws_lambda_function_url" "url_get_likes_on_post" {
  function_name      = aws_lambda_function.lambda_get_likes_on_post.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda follow_user
resource "aws_lambda_function_url" "url_follow_user" {
  function_name      = aws_lambda_function.lambda_follow_user.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda unfollow_user
resource "aws_lambda_function_url" "url_unfollow_user" {
  function_name      = aws_lambda_function.lambda_unfollow_user.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["DELETE"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_following
resource "aws_lambda_function_url" "url_get_following" {
  function_name      = aws_lambda_function.lambda_get_following.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_followers
resource "aws_lambda_function_url" "url_get_followers" {
  function_name      = aws_lambda_function.lambda_get_followers.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda create_user_profile
resource "aws_lambda_function_url" "url_create_user_profile" {
  function_name      = aws_lambda_function.lambda_create_user_profile.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["POST"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_user_profile
resource "aws_lambda_function_url" "url_get_user_profile" {
  function_name      = aws_lambda_function.lambda_get_user_profile.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# create a Function URL for Lambda get_following_posts
resource "aws_lambda_function_url" "url_get_following_posts" {
  function_name = aws_lambda_function.lambda_get_following_posts.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = ["*"]
    allow_methods     = ["GET"]
    allow_headers     = ["*"]
    expose_headers    = ["keep-alive", "date"]
  }
}

# show all Lambda Function URLs
output "lambda_url_create_post" {
  value = aws_lambda_function_url.url_create_post.function_url
}

output "lambda_url_get_all_posts" {
  value = aws_lambda_function_url.url_get_all_posts.function_url
}

output "lambda_url_get_personal_posts" {
  value = aws_lambda_function_url.url_get_personal_posts.function_url
}

output "lambda_url_delete_post" {
  value = aws_lambda_function_url.url_delete_post.function_url
}

output "lambda_url_create_comment" {
  value = aws_lambda_function_url.url_create_comment.function_url
}

output "lambda_url_delete_comment" {
  value = aws_lambda_function_url.url_delete_comment.function_url
}

output "lambda_url_get_comments_on_post" {
  value = aws_lambda_function_url.url_get_comments_on_post.function_url
}

output "lambda_url_like_post" {
  value = aws_lambda_function_url.url_like_post.function_url
}

output "lambda_url_unlike_post" {
  value = aws_lambda_function_url.url_unlike_post.function_url
}

output "lambda_url_get_users_liked_posts" {
  value = aws_lambda_function_url.url_get_users_liked_posts.function_url
}

output "lambda_url_get_likes_on_post" {
  value = aws_lambda_function_url.url_get_likes_on_post.function_url
}

output "lambda_url_follow_user" {
  value = aws_lambda_function_url.url_follow_user.function_url
}

output "lambda_url_unfollow_user" {
  value = aws_lambda_function_url.url_unfollow_user.function_url
}

output "lambda_url_get_following" {
  value = aws_lambda_function_url.url_get_following.function_url
}

output "lambda_url_get_followers" {
  value = aws_lambda_function_url.url_get_followers.function_url
}

output "lambda_url_create_user_profile" {
  value = aws_lambda_function_url.url_create_user_profile.function_url
}

output "lambda_url_get_user_profile" {
  value = aws_lambda_function_url.url_get_user_profile.function_url
}

output "lambda_url_get_following_posts" {
  value = aws_lambda_function_url.url_get_following_posts.function_url
}