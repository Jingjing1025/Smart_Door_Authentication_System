/*
Creating the Amazon Rekognition Video Stream Processor 
Before you can analyze a streaming video, you create an Amazon Rekognition Video stream processor (CreateStreamProcessor). 
The stream processor contains information about the Kinesis data stream and the Kinesis video stream. 
It also contains the identifier for the collection that contains the faces you want to recognize in the input streaming video. 
You also specify a name for the stream processor. The following is a JSON example for the CreateStreamProcessor request. 
*/


{
       "Name": "streamProcessorForCam",
       "Input": {
              "KinesisVideoStream": {
                     "Arn": "arn:aws:kinesisvideo:us-east-1:nnnnnnnnnnnn:stream/inputVideo"
              }
       },
       "Output": {
              "KinesisDataStream": {
                     "Arn": "arn:aws:kinesis:us-east-1:nnnnnnnnnnnn:stream/outputData"
              }
       },
       "RoleArn": "arn:aws:iam::nnnnnnnnnnn:role/roleWithKinesisPermission",
       "Settings": {
              "FaceSearch": {
                     "CollectionId": "collection-with-100-faces",
                     "FaceMatchThreshold": 85.5
              }
       }
}

/*
The following is an example response from CreateStreamProcessor. 
*/

{
       “StreamProcessorArn”: “arn:aws:rekognition:us-east-1:nnnnnnnnnnnn:streamprocessor/streamProcessorForCam”
}

/*
Starting the Amazon Rekognition Video Stream Processor 
You start analyzing streaming video by calling StartStreamProcessor with the stream processor name that you specified in CreateStreamProcessor. 
The following is a JSON example for the StartStreamProcessor request. 
*/

{
       "Name": "streamProcessorForCam"
}

/*
If the stream processor successfully starts, an HTTP 200 response is returned, along with an empty JSON body. 
Using Stream Processors
The following example code shows how to call various stream processor operations, such as CreateStreamProcessor and StartStreamProcessor. 
The example includes a stream processor manager class (StreamManager) that provides methods to call stream processor operations. 
The starter class (Starter) creates a StreamManager object and calls various operations. 

To configure the example:
1. Set the values of the Starter class member fields to your desired values.
2. In the Starter class function main, uncomment the desired function call. 

Starter Class

//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

// Starter class. Use to create a StreamManager class
// and call stream processor operations.

*/

package com.amazonaws.samples;
import com.amazonaws.samples.*;

public class Starter {

	public static void main(String[] args) {
		
		
    	String streamProcessorName="Stream Processor Name";
    	String kinesisVideoStreamArn="Kinesis Video Stream Arn";
    	String kinesisDataStreamArn="Kinesis Data Stream Arn";
    	String roleArn="Role Arn";
    	String collectionId="Collection ID";
    	Float matchThreshold=50F;

		try {
			StreamManager sm= new StreamManager(streamProcessorName,
					kinesisVideoStreamArn,
					kinesisDataStreamArn,
					roleArn,
					collectionId,
					matchThreshold);
			//sm.createStreamProcessor();
			//sm.startStreamProcessor();
			//sm.deleteStreamProcessor();
			//sm.deleteStreamProcessor();
			//sm.stopStreamProcessor();
			//sm.listStreamProcessors();
			//sm.describeStreamProcessor();
		}
		catch(Exception e){
			System.out.println(e.getMessage());
		}
	}
}

/*
StreamManager Class
*/

//Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
//PDX-License-Identifier: MIT-0 (For details, see https://github.com/awsdocs/amazon-rekognition-developer-guide/blob/master/LICENSE-SAMPLECODE.)

// Stream manager class. Provides methods for calling
// Stream Processor operations.
package com.amazonaws.samples;

import com.amazonaws.services.rekognition.AmazonRekognition;
import com.amazonaws.services.rekognition.AmazonRekognitionClientBuilder;
import com.amazonaws.services.rekognition.model.CreateStreamProcessorRequest;
import com.amazonaws.services.rekognition.model.CreateStreamProcessorResult;
import com.amazonaws.services.rekognition.model.DeleteStreamProcessorRequest;
import com.amazonaws.services.rekognition.model.DeleteStreamProcessorResult;
import com.amazonaws.services.rekognition.model.DescribeStreamProcessorRequest;
import com.amazonaws.services.rekognition.model.DescribeStreamProcessorResult;
import com.amazonaws.services.rekognition.model.FaceSearchSettings;
import com.amazonaws.services.rekognition.model.KinesisDataStream;
import com.amazonaws.services.rekognition.model.KinesisVideoStream;
import com.amazonaws.services.rekognition.model.ListStreamProcessorsRequest;
import com.amazonaws.services.rekognition.model.ListStreamProcessorsResult;
import com.amazonaws.services.rekognition.model.StartStreamProcessorRequest;
import com.amazonaws.services.rekognition.model.StartStreamProcessorResult;
import com.amazonaws.services.rekognition.model.StopStreamProcessorRequest;
import com.amazonaws.services.rekognition.model.StopStreamProcessorResult;
import com.amazonaws.services.rekognition.model.StreamProcessor;
import com.amazonaws.services.rekognition.model.StreamProcessorInput;
import com.amazonaws.services.rekognition.model.StreamProcessorOutput;
import com.amazonaws.services.rekognition.model.StreamProcessorSettings;

public class StreamManager {

    private String streamProcessorName;
    private String kinesisVideoStreamArn;
    private String kinesisDataStreamArn;
    private String roleArn;
    private String collectionId;
    private float matchThreshold;

    private AmazonRekognition rekognitionClient;
    

    public StreamManager(String spName,
    		String kvStreamArn,
    		String kdStreamArn,
    		String iamRoleArn,
    		String collId,
    		Float threshold){
    	streamProcessorName=spName;
    	kinesisVideoStreamArn=kvStreamArn;
    	kinesisDataStreamArn=kdStreamArn;
    	roleArn=iamRoleArn;
    	collectionId=collId;
    	matchThreshold=threshold;
    	rekognitionClient=AmazonRekognitionClientBuilder.defaultClient();
    	
    }
    
    public void createStreamProcessor() {
    	//Setup input parameters
        KinesisVideoStream kinesisVideoStream = new KinesisVideoStream().withArn(kinesisVideoStreamArn);
        StreamProcessorInput streamProcessorInput =
                new StreamProcessorInput().withKinesisVideoStream(kinesisVideoStream);
        KinesisDataStream kinesisDataStream = new KinesisDataStream().withArn(kinesisDataStreamArn);
        StreamProcessorOutput streamProcessorOutput =
                new StreamProcessorOutput().withKinesisDataStream(kinesisDataStream);
        FaceSearchSettings faceSearchSettings =
                new FaceSearchSettings().withCollectionId(collectionId).withFaceMatchThreshold(matchThreshold);
        StreamProcessorSettings streamProcessorSettings =
                new StreamProcessorSettings().withFaceSearch(faceSearchSettings);

        //Create the stream processor
        CreateStreamProcessorResult createStreamProcessorResult = rekognitionClient.createStreamProcessor(
                new CreateStreamProcessorRequest().withInput(streamProcessorInput).withOutput(streamProcessorOutput)
                        .withSettings(streamProcessorSettings).withRoleArn(roleArn).withName(streamProcessorName));

        //Display result
        System.out.println("Stream Processor " + streamProcessorName + " created.");
        System.out.println("StreamProcessorArn - " + createStreamProcessorResult.getStreamProcessorArn());
    }

    public void startStreamProcessor() {
        StartStreamProcessorResult startStreamProcessorResult =
                rekognitionClient.startStreamProcessor(new StartStreamProcessorRequest().withName(streamProcessorName));
        System.out.println("Stream Processor " + streamProcessorName + " started.");
    }

    public void stopStreamProcessor() {
        StopStreamProcessorResult stopStreamProcessorResult =
                rekognitionClient.stopStreamProcessor(new StopStreamProcessorRequest().withName(streamProcessorName));
        System.out.println("Stream Processor " + streamProcessorName + " stopped.");
    }

    public void deleteStreamProcessor() {
        DeleteStreamProcessorResult deleteStreamProcessorResult = rekognitionClient
                .deleteStreamProcessor(new DeleteStreamProcessorRequest().withName(streamProcessorName));
        System.out.println("Stream Processor " + streamProcessorName + " deleted.");
    }

    public void describeStreamProcessor() {
        DescribeStreamProcessorResult describeStreamProcessorResult = rekognitionClient
                .describeStreamProcessor(new DescribeStreamProcessorRequest().withName(streamProcessorName));

        //Display various stream processor attributes.
        System.out.println("Arn - " + describeStreamProcessorResult.getStreamProcessorArn());
        System.out.println("Input kinesisVideo stream - "
                + describeStreamProcessorResult.getInput().getKinesisVideoStream().getArn());
        System.out.println("Output kinesisData stream - "
                + describeStreamProcessorResult.getOutput().getKinesisDataStream().getArn());
        System.out.println("RoleArn - " + describeStreamProcessorResult.getRoleArn());
        System.out.println(
                "CollectionId - " + describeStreamProcessorResult.getSettings().getFaceSearch().getCollectionId());
        System.out.println("Status - " + describeStreamProcessorResult.getStatus());
        System.out.println("Status message - " + describeStreamProcessorResult.getStatusMessage());
        System.out.println("Creation timestamp - " + describeStreamProcessorResult.getCreationTimestamp());
        System.out.println("Last update timestamp - " + describeStreamProcessorResult.getLastUpdateTimestamp());
    }

    public void listStreamProcessors() {
        ListStreamProcessorsResult listStreamProcessorsResult =
                rekognitionClient.listStreamProcessors(new ListStreamProcessorsRequest().withMaxResults(100));

        //List all stream processors (and state) returned from Rekognition
        for (StreamProcessor streamProcessor : listStreamProcessorsResult.getStreamProcessors()) {
            System.out.println("StreamProcessor name - " + streamProcessor.getName());
            System.out.println("Status - " + streamProcessor.getStatus());
        }
    }
}