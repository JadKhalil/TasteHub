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
        "dynamodb:UpdateItem"
      ],
      "Resource": ["arn:aws:logs:*:*:*", "${aws_dynamodb_table.tastehub-users.arn}", "${aws_dynamodb_table.tastehub-posts.arn}",
                    "${aws_dynamodb_table.tastehub-likes.arn}", "${aws_dynamodb_table.tastehub-comments.arn}", "${aws_dynamodb_table.tastehub-follows.arn}"],
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

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
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

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
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

  # up to 8KB read per second (eventually consistent)
  read_capacity = 1

  # up to 1KB per second
  write_capacity = 1

  # primary key (hash_key) is user email of the person who follows the followee
  hash_key  = "userEmailOfFollower"

  # secondary key (range_key) is the user email of the person being followed
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
}

/* 
 Creating archive file for all lambda functions
*/

# creating archive file for create_post
data "archive_file" "create_post" {
  type        = "zip"
  source_file = "../functions/posts/create_post/main.py"
  output_path = "../functions/posts/create_post/${local.artifact_name}"
}

# creating archive file for create_comment
data "archive_file" "create_comment" {
  type        = "zip"
  source_file = "../functions/comments/create_comment/main.py"
  output_path = "../functions/comments/create_comment/${local.artifact_name}"
}

# create a Lambda function for create_post
resource "aws_lambda_function" "lambda_create_post" {
  role             = aws_iam_role.lambda.arn
  function_name    = "tastehub-create_post"
  handler          = local.handler_name
  filename         = "../functions/posts/create_post/${local.artifact_name}"
  source_code_hash = data.archive_file.create_post.output_base64sha256
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

# show all Lambda Function URLs
output "lambda_url_create_post" {
  value = aws_lambda_function_url.url_create_post.function_url
}

output "lambda_url_create_comment" {
  value = aws_lambda_function_url.url_create_comment.function_url
}