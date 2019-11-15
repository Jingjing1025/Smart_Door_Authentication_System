import boto3
import json
import random
from datetime import datetime
import time
from boto3.dynamodb.conditions import Key, Attr
import os
import sys
sys.path.insert(1,'/opt/')
import cv2

region = 'us-west-2' # For example, us-west-1
service = 'es'
credentials = boto3.Session().get_credentials()
# awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, region, service, session_token=credentials.token)


def sendSNS(phone_number, message):
    # Create an SNS client
    sns = boto3.client('sns')
    
    # Publish a simple message to the specified SNS topic
    response = sns.publish(
        PhoneNumber=phone_number,
        Message=message,
        Subject='AWS SNS test',
        MessageStructure='string'
    )
    
    # Print out the response
    print(response)

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
        if 'phone' in response['Items'][0]:
            return response['Items'][0]['phone']
        else:
            return "-1"  # Visitor exists in database but not yet approved by the owner
    else:
        return None


def storeToDB1(faceId, otp):
    create_time = int(time.time())
    expire_time = create_time + 5*60

    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('passcodes')

    try:
        response = table.put_item(
            TableName='passcodes',
            Item={
                'faceId' : faceId,
                'otp' : otp,
                'CreationTime' : str(create_time),
                'ttl' : str(expire_time)
            }
        )
    except Exception as err:
        print("Error storing to passcodes db: ", err)


def storeToDB2(faceId, photo):
    client = boto3.resource('dynamodb',
                      region_name=region,
                      aws_access_key_id='',
                      aws_secret_access_key='')
    table = client.Table('visitor')

    print(photo)

    try:
        response = table.put_item(
            TableName='visitors',
            Item={
                'faceId' : faceId,
                'photos' : [photo]
            }
        )
    except Exception as err:
        print("Error storing to passcodes db: ", err)


def extract_frame():
    kvs_client = boto3.client('kinesisvideo')
    kvs_data_pt = kvs_client.get_data_endpoint(
        StreamARN='', # kinesis stream arn
        APIName='GET_MEDIA'
    )
    
    print("kvs_data_pt")
    print(kvs_data_pt)
    
    end_pt = kvs_data_pt['DataEndpoint']
    kvs_video_client = boto3.client('kinesis-video-media', endpoint_url=end_pt, region_name='us-west-2') # provide your region
    kvs_stream = kvs_video_client.get_media(
        StreamARN='', # kinesis stream arn
        StartSelector={'StartSelectorType': 'NOW'} # to keep getting latest available chunk on the stream
    )
    
    print("kvs_stream")
    print(kvs_stream)

    with open('/tmp/stream.mkv', 'wb') as f:
        streamBody = kvs_stream['Payload'].read(256*4096) # reads min(16MB of payload, payload size) - can tweak this
        f.write(streamBody)
        
        print("streamBody")
        print(os.stat('/tmp/stream.mkv'))
        
        # use openCV to get a frame
        cap = cv2.VideoCapture('/tmp/stream.mkv')

        print("capture")

        # use some logic to ensure the frame being read has the person, something like bounding box or median'th frame of the video etc
        ret, frame = cap.read() 
        cv2.imwrite('/tmp/my-photo.jpg', frame)
        s3_client = boto3.client('s3')
        s3_client.upload_file(
            '/tmp/my-photo.jpg',
            'hw2oregon', # replace with your bucket name
            'my-photo.jpg'
        )
        
        print("upload_file")
        
        cap.release()
        print('Image uploaded')
        
def match_face(bucket, collectionId, fileName):
    
    # bucket='hw2oregon'
    # collectionId='test_collection2'
    # fileName='Minghao4.jpg'
    threshold = 80
    maxFaces=100

    client=boto3.client('rekognition')
    try:
        response=client.search_faces_by_image(CollectionId=collectionId,
                                    Image={'S3Object':{'Bucket':bucket,'Name':fileName}},
                                    FaceMatchThreshold=threshold,
                                    MaxFaces=maxFaces)
    except:
        return (False, None)

    faceMatches=response['FaceMatches']
    print (type(faceMatches))
    print ('Matching faces')
    max_similarity = 0.00
    if len(faceMatches) == 0:
        return (False, None)
    for match in faceMatches:
        print ('FaceId:' + match['Face']['FaceId'])
        similarity = match['Similarity']
        max_similarity = max(max_similarity, similarity)
        print ('Similarity: ' + "{:.2f}".format(match['Similarity']) + "%")
    return (True, faceMatches[0]['Face']['FaceId'])


def index_face(bucket, collectionId, photo):
    
    client=boto3.client('rekognition')
    # response = client.create_collection(CollectionId=collectionId)
    # bucket='hw2oregon'
    # photo='Minghao2.jpg'
    
    client=boto3.client('rekognition')

    response=client.index_faces(CollectionId=collectionId,
                                Image={'S3Object':{'Bucket':bucket,'Name':photo}},
                                ExternalImageId=photo,
                                MaxFaces=1,
                                QualityFilter="AUTO",
                                DetectionAttributes=['ALL'])

    # print ('Results for ' + photo) 	
    print('Faces indexed:')						
    for faceRecord in response['FaceRecords']:
         print('  Face ID: ' + faceRecord['Face']['FaceId'])
         print('  Location: {}'.format(faceRecord['Face']['BoundingBox']))

    # print('Faces not indexed:')
    for unindexedFace in response['UnindexedFaces']:
        print(' Location: {}'.format(unindexedFace['FaceDetail']['BoundingBox']))
        print(' Reasons:')
        for reason in unindexedFace['Reasons']:
            print('   ' + reason)
            
# Lambda execution starts here
def lambda_handler(event, context):
    owner_phone_number = ''
    
    extract_frame()
    create_time = datetime.now()
    
    client=boto3.client('rekognition')
    
    bucket='hw2oregon'
    collectionId='collection1'
    fileName='my-photo.jpg'
    
    # response = client.create_collection(CollectionId=collectionId)
    
    matched, faceId=match_face(bucket, collectionId, fileName)
    
    if matched:
        print ("face is matched")
        print ("face id is: ", faceId)
    else:
        if faceId is None:
            return
        index_face(bucket, collectionId, fileName)
        print ("face is not matched")

    photo = {
        'objectKey': 'my-photo.jpg',
        'bucket': 'hw2oregon',
        'createdTimestamp': str(create_time)
    }
    
    numbers = random.sample(range(10), 6)
    otp = ""
    for i in numbers:
        otp += str(i)

    print("main")
    
    phone_number = queryFromDB2(faceId)
    print(phone_number)
    
    photo_url = 'https://hw2oregon.s3-us-west-2.amazonaws.com/my-photo.jpg'
    web_url = 'http://hw2oregon.s3-website-us-west-2.amazonaws.com?faceId='
    
    if (phone_number is not None and phone_number != "-1"):
        storeToDB1(faceId, otp)
        msg = "Welcome, here is your passcode: " + otp
        sendSNS(phone_number, msg)
    else:
        if phone_number is None:
            storeToDB2(faceId, photo)
        msg = "Visitor not recognized. Here is the photo of the visitor : " + photo_url + " New User Entry Form: " + web_url + faceId
        sendSNS(owner_phone_number, msg)