import boto3
import json
import random
import datetime
import time
# from requests_aws4auth import AWS4Auth
from boto3.dynamodb.conditions import Key, Attr

region = 'us-west-2' # For example, us-west-1
service = 'es'
credentials = boto3.Session().get_credentials()
# awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)


def sendSNS(phone_number, message):
    # Create an SNS client
    sns = boto3.client('sns')
    
    # Publish a simple message to the specified SNS topic
    response = sns.publish(
        PhoneNumber='+1'+phone_number,
        Message=message,
        Subject='AWS SNS test',
        MessageStructure='string'
    )
    
    # Print out the response
    print(response)


def storeToDB2(faceId, name, phone, photo):

    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('visitors')

    try:
        response = table.put_item(
            TableName='visitors',
            Item={
                'faceId' : faceId,
                'name' : name,
                'phone' : "+1" + phone,
                'photos': photo
            }
        )
    except Exception as err:
        print("Error storing to visitors db: ", err)

def storeToDB1(faceId, otp):
    
    create_time = int(time.time())
    expire_time = create_time + 2*60
    
    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('passcodes')
    try:
        response = table.put_item(
            TableName='passcodes',
            Item={
                'otp' : otp,
                'faceId' : faceId,
                'CreationTime' : str(create_time),
                'ttl' : str(expire_time)
            }
        )
        
    except Exception as err:
        print("Error storing to passcodes db: ", err)

def queryFromDB2(faceId):
    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('visitors')
    
    response = table.query(
    KeyConditionExpression=Key('faceId').eq(faceId)
    )
    
    print (response)
    
    if len(response['Items']) is not 0:
        if 'photos' in response['Items'][0]:
            return response['Items'][0]['photos']
    else:
        return None


# Lambda execution starts here
def lambda_handler(event, context):
    
    print (event)
    
    numbers = random.sample(range(10), 6)
    otp = ""
    for i in numbers:
        otp += str(i)
    
    
    
    name=event['name']
    phone = event['phone']
    faceId = event['faceId']
    
    photo = queryFromDB2(faceId)
    
    if photo is not None:
        storeToDB2(faceId, name, phone, photo)
        storeToDB1(faceId, otp)
        msg = "Welcome, here is your passcode: " + otp
        sendSNS(phone, msg)
