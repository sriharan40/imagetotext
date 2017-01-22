'use strict';

var tesseract = require('node-tesseract');
 
// Recognize text of any language in any format
tesseract.process(__dirname + '/images/image.png',function(err, text) {
    if(err) {
        console.error(err);
    } else {
        console.log(text);
    }
});
 
// Recognize German text in a single uniform block of text and set the binary path
 
var options = {
    l: 'deu',
    psm: 6,
    binary: '/usr/local/bin/tesseract'
};
 
tesseract.process(__dirname + '/images/image.png', options, function(err, text) {
    if(err) {
        console.error(err);
    } else {
        console.log(text);
    }
});

/* var Tesseract = require('tesseract.js')
var filename = 'images/image.jpg'

Tesseract.recognize(filename)
  .progress(function  (p) { console.log('progress', p)  })
  .catch(err => console.error(err))
  .then(function (result) {
    console.log(result.text)
    process.exit(0)
  }) */
