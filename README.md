# TasteHub
ENSF 401 App Project

[Website Link](https://main--thetastehub.netlify.app/)

[Demo Video](https://youtu.be/yDBssWRU05M)


---
#### Things to know for backend development
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
- The api_key and cloud_name in the `create_post` and `create_user_profile` must be hard coded. Make sure to use the API key, and not the secret API key.  d