# TasteHub
ENSF 401 App Project

### Lambda function URLS
- lambda_url_create_comment = "https://lnuwf7hmrat6ugtrnz7psympzq0zjlcx.lambda-url.ca-central-1.on.aws/"
- lambda_url_create_post = "https://w6twud32h2wkjxtnjdml6vlbq40hrtgx.lambda-url.ca-central-1.on.aws/"
- lambda_url_create_user_profile = "https://hqp3zbqf4uunvhiunkf3ttpvgi0euppk.lambda-url.ca-central-1.on.aws/"
- lambda_url_delete_comment = "https://arocnlgm5i7sjrxb34mimhvfmm0nxfft.lambda-url.ca-central-1.on.aws/"
- lambda_url_follow_user = "https://rl4au3ybjajtx62g23eyzmiuce0ifzkc.lambda-url.ca-central-1.on.aws/"
- lambda_url_get_comments_on_post = "https://nenqkh35mmdevuny2x7gbozquu0cquyy.lambda-url.ca-central-1.on.aws/"
- lambda_url_get_followers = "https://kmjp6z5oboueqdiz5yaolqkm3a0lulye.lambda-url.ca-central-1.on.aws/"
- lambda_url_get_following = "https://wzw3w4ygt7nrso37nmtlul6fpi0hrmbe.lambda-url.ca-central-1.on.aws/"
- lambda_url_get_likes_on_post = "https://jvvn5kge6vo2kd5ovsafif2fyi0mfusn.lambda-url.ca-central-1.on.aws/"
- lambda_url_get_users_liked_posts = "https://fmepbkghyequf22cdhtoerx7ui0gtimv.lambda-url.ca-central-1.on.aws/"
- lambda_url_like_post = "https://en46iryruu4einvaoz24oq5lie0ifwvy.lambda-url.ca-central-1.on.aws/"
- lambda_url_unfollow_user = "https://jphbbhraofx2bnza766vsdujtq0bfdla.lambda-url.ca-central-1.on.aws/"
- lambda_url_unlike_post = "https://bvraqaptwxnnop2ruzr26h5ppe0wtrxi.lambda-url.ca-central-1.on.aws/"

### Things to know for backend development
###### Some things needs to be hard coded if you want to deploy a backend on YOUR AWS account.

- In AWS Parameter Store, you must manually create a `/tastehub/cloudinary-key` with Cloudinary API Secret Key stored as SecureString. We don't want to include this sensitive data in our lambda functions so this needs to be manually done.
- In the Terraform configuration file, `main.tf`, the aws_iam_policy must also be hard coded depending on the user. The random string of numbers below is your IAM Account ID.

    - `"arn:aws:ssm:ca-central-1:228775797536:parameter/tastehub/"`

    - `"arn:aws:kms:ca-central-1:228775797536:key/c531aee2-2247-4d3c-bd1a-1330532571cc"`

        ```
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
        ```
- The api_key and cloud_name in the `create_post` and `create_user_profile` must be hard coded. Make sure to use the API key, and not the secret API key. 


### Start the project
- `git clone https://github.com/JadKhalil/TasteHub`
- `npm install` to install all dependencies
- Please don't push to main branch. Pull requests only :)