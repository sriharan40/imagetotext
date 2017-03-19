'use strict';

var express = require('express');
var fs = require('fs');
var util = require('util');
var mime = require('mime');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
const REST_PORT = (process.env.PORT || 5111);

// Set up auth
var gcloud = require('google-cloud')({
  keyFilename: 'GoogleOCRPOC-e4b04e9203c7.json',
  projectId: 'single-planet-159413'
});

var vision = gcloud.vision();

var app = express();

// Simple upload form
var form = '<!DOCTYPE HTML><html><body>' +
  "<form method='post' action='/upload' enctype='multipart/form-data'>" +
  "<input type='file' name='image'/>" +
  "<input type='submit' /></form>" +
  '</body></html>';

app.get('/', function(req, res) {

var params=function(req){
  var q=req.url.split('?'),result={};
  if(q.length>=2){
      q[1].split('&').forEach((item)=>{
           try {
             result[item.split('=')[0]]=item.split('=')[1];
           } catch (e) {
             result[item.split('=')[0]]='';
           }
      })
  }
  return result;
}

req.params=params(req);

var image_url = req.params.image_url;

console.log("Path: "+image_url);

if(image_url)
{
	
var types = ['text'];

//console.log("Req: "+req.body.toString());
    
// Send the image to the Cloud Vision API
vision.detect(image_url, types, function(err, detections, apiResponse) {
//vision.detectText(req.file.path, function(err, text, apiResponse) {  
  if (err) {
      res.end('Cloud Vision Error');
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write('<!DOCTYPE HTML><html><body>');

      // Base64 the image so we can display it on the page
      res.write('<img width=200 src="' + image_url + '">');

      //var jsonOutput = JSON.parse(apiResponse);
      var texts = JSON.stringify(apiResponse.responses[0].textAnnotations[0].description);
      var textsHtmlwithoutQuotes = texts.replace(/"/g, '');
      var textWithNextline = textsHtmlwithoutQuotes.replace(/\\n/g, '</br>');
      console.log("Check texts ::>>" + textWithNextline);
      // Write out the JSON output of the Vision API
       //res.write(JSON.stringify(jsonObj.textAnnotations, null, 4));
      
      res.write('<p>' + textWithNextline + '</p>', null, 4);

      // Delete file (optional)
      fs.unlinkSync(image_url);

      res.end('</body></html>');
    }	

});

}

else
{
res.writeHead(200, {
    'Content-Type': 'text/html'
  });
  res.end(form);
}

});

// Get the uploaded image
// Image is uploaded to req.file.path
app.post('/upload', upload.single('image'), function(req, res, next) {

// Choose what the Vision API should detect
// Choices are: faces, landmarks, labels, logos, properties, safeSearch, texts
var types = ['text'];

//console.log("Req: "+req.body.toString());
  
console.log("Path: "+req.file.path);
  
// Send the image to the Cloud Vision API
vision.detect(req.file.path, types, function(err, detections, apiResponse) {
//vision.detectText(req.file.path, function(err, text, apiResponse) {  
  if (err) {
      res.end('Cloud Vision Error');
    } else {
      res.writeHead(200, {
        'Content-Type': 'text/html'
      });
      res.write('<!DOCTYPE HTML><html><body>');

      // Base64 the image so we can display it on the page
      res.write('<img width=200 src="' + base64Image(req.file.path) + '">');

      //var jsonOutput = JSON.parse(apiResponse);
      var texts = JSON.stringify(apiResponse.responses[0].textAnnotations[0].description);
      var textsHtmlwithoutQuotes = texts.replace(/"/g, '');
      var textWithNextline = textsHtmlwithoutQuotes.replace(/\\n/g, '</br>');
      console.log("Check texts ::>>" + textWithNextline);
      // Write out the JSON output of the Vision API
       //res.write(JSON.stringify(jsonObj.textAnnotations, null, 4));
      
      res.write('<p>' + textWithNextline + '</p>', null, 4);

      // Delete file (optional)
      fs.unlinkSync(req.file.path);

      res.end('</body></html>');
    }
  });
});

app.listen(REST_PORT, () => {
    console.log('Rest service ready on port ' + REST_PORT);
});

//console.log('Server Started');

// Turn image into Base64 so we can display it easily

function base64Image(src) {
  var data = fs.readFileSync(src).toString('base64');
  return util.format('data:%s;base64,%s', mime.lookup(src), data);
}
