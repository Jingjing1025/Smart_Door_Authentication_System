import json
import boto3
import base64
client = boto3.client('kinesis')
def lambda_handler(event, context):
    coded_string = event["Records"][0]["kinesis"]["data"]
    decoded = base64.b64decode(coded_string)
    response = client.put_record(
        StreamName='demoStream2',
        Data=decoded,
        PartitionKey='string',
    )
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
