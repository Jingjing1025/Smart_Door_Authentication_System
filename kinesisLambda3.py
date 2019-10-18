import json
import boto3
s3 = boto3.client('s3')
import base64
def lambda_handler(event, context):
    coded_string = event["Records"][0]["kinesis"]["data"]
    decoded = base64.b64decode(coded_string)
    bucket_name = 'democloudkinesis123'
    s3.put_object(Body=decoded, Bucket = bucket_name, Key = "demo.jpg", ContentType= "images/jpeg")
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
