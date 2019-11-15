import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import time
import datetime

region = 'us-west-2'
def lambda_handler(event, context):
    # TODO implement
    inputToken = event['lastUserMessage']
    
    faceID = queryFromDB1(inputToken)
    if faceID =="":
        return {
        'statusCode': 200,
        'body': json.dumps({ 'status': 'Fail', 'info': None})
        }
    print('start querying from DB2')
    name = queryFromDB2(faceID)

    return {
        'statusCode': 200,
        'body': json.dumps( { 'status': 'Success', 'info': name})
    }
    


def queryFromDB1(otp):
    
    epochTimeNow = int(time.time())
    
    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('passcodes')
    
    response = table.query(
        KeyConditionExpression= '#otp = :otp',
        FilterExpression = '#t > :ttl',
        ExpressionAttributeNames = {
                '#t': 'ttl',
                '#otp': 'otp'
            },
            ExpressionAttributeValues = {
                ':ttl': str(epochTimeNow),
                ':otp': otp
            }
    )
    
    if len(response['Items']) == 0:
        return ("")
    
    return response['Items'][0]['faceId']
    
def queryFromDB2(faceID):
    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('visitors')
    
    response = table.query(
    KeyConditionExpression=Key('faceId').eq(faceID)
    )
    #print ('response from db2:', response)
    return response['Items'][0]['name']