import json
import boto3
import base64
import botocore.vendored.requests as requests

client = boto3.client('kinesis')

def get_as_base64(url)
    return base64.b64encode(requests.get(url).content)
    
def lambda_handler(event, context)
    url = httpwww.aviewoncities.comimgnyckveus0602s.jpg
    b64 = get_as_base64(url)
    response = client.put_record(
        StreamName='demoStream1',
        Data=base64.b64decode(b64),
        PartitionKey='string',
    )
    print(response)
    return {
        'statusCode' 200,
        'body' json.dumps('Hello from Lambda!')
    }
