var apigClient = apigClientFactory.newClient({
    accessKey: '',
    secretKey: ''
});

//var messages = "";
var lastUserMessage = "";
//AWS.config.region = 'us-east-1'


function trigger_kvs(){
  // console.log("Inside trigger kvs");
  var params = {};
  var additionalParams = {};
  var body = {
    };
  apigClient.lFHW2Post(params, body, additionalParams)
      .then(function(result){
      popUpWindow("inside kvs trigger!")
      }).catch( function(result){
          console.log("Inside Catch Function");
      });

  }

function Response() {

  var params = {};
  var additionalParams = {};
  var body = {
    "lastUserMessage" : lastUserMessage
    };
    // alert(lastUserMessage+" response");
    apigClient.visitorPost(params, body, additionalParams)
      .then(function(result){
        //alert(lastUserMessage+" response");
        //returnMessage = String(result['data']);
        var info = result['data']['body']
        returnMessage = JSON.parse(info)

        /*console.log("bot says " + String(result['data']));

        
        messages.push(botMessage + "<b> :" + botName);
        for (var i = 1; i < 8; i++) {
          if (messages[messages.length - i])
            document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
        }*/
      
      if(returnMessage['status'] == "Success"){
         popUpWindow("Success! Welcome to my house "+ returnMessage['info']+"!");
      }
      else{
        popUpWindow("Permission denied.");
      }
      }).catch( function(result){
          console.log("Inside Catch Function");
      });

      // return botMessage;
}

//this runs each time enter is pressed.
//It controls the overall input and output
function newEntry() {
  //if the message from the user isn't empty then run
  if (document.getElementById("OTP_field").value != "") {

    lastUserMessage = document.getElementById("OTP_field").value;
    document.getElementById("OTP_field").value = "";
    //alert("message gotten!")
    //messages.push("<b>User:</b> " + lastUserMessage);
    /*
    for (var i = 1; i < 8; i++) {
      if (messages[messages.length - i])
        document.getElementById("chatlog" + i).innerHTML = messages[messages.length - i];
    }
    console.log("hello world");
    */
    Response();
  }
}


//if the key pressed is 'enter' runs the function newEntry()
function keyPress(e) {
  var x = e || window.event;
  var key = (x.keyCode || x.which);
  if (key == 13 || key == 3) {
    //runs this function when enter is pressed
    newEntry();
  }
}

//clears the placeholder text ion the chatbox
//this function is set to run when the users brings focus to the chatbox, by clicking on it
function placeHolder() {
  document.getElementById("chatbox").placeholder = "";
}

function videoStream(){
         var video = document.getElementById('video');
         if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
             navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
             video.srcObject = stream;
             video.play();
             });
         }
     }
 
 function snapshot(){
     var canvas = document.getElementById('canvas');
     var context = canvas.getContext('2d');
     var video = document.getElementById('video');
     document.getElementById("snap").addEventListener("click", function() {
                                                    context.drawImage(video, 0, 0, 640, 480);
                                                    });
 }

function popUpWindow(responseMessage){
  //var txtName = document.getElementById("txtName");
  //var txtOutput = document.getElementById("txtOutput");
  //var name = txtName.value;
  alert(responseMessage)
}

function getAlert(){
   alert("message gotten!");
}