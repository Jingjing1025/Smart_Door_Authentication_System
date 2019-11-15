var apigClient = apigClientFactory.newClient({
    accessKey: '',
    secretKey: ''
});


// Submit form
function submitAll() {

console.log("inside submitAll");

var name = document.getElementById("name").value;
var phone = document.getElementById("phone").value;
var id = document.getElementById("FaceID").value

console.log(name + " " + phone);

if (validation()) // Calling validation function
{

  var params = {};
  var additionalParams = {};
  var body = {
    "name" : name,
    "phone" : phone,
    "faceId" : id
    };

    console.log(name + phone + id);

    apigClient.ownerPost(params, body, additionalParams)
      .then(function(result){
        console.log("inside then");
      }).catch( function(result){
          console.log("Inside Catch Function");
      });

// var x = document.getElementsByName('form_name');
// x[0].submit(); //form submission
// alert(" Name : " + name + " n phone : " + phone + " n Form Name : " + document.getElementById("form_id").getAttribute("name") + "nn Form Submitted Successfully......");
}

}

// Name and phone validation Function.
function validation() {
var name = document.getElementById("name").value;
var phone = document.getElementById("phone").value;
var phoneReg = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/;
if (name === '' || phone === '') {
alert("Please fill all fields...!!!!!!");
return false;
} else if (!(phone).match(phoneReg)) {
alert("Invalid phone...!!!!!!");
return false;
} else {
return true;
}
}
