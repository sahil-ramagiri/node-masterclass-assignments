/*
  Homework assignment #1
*/


// import all dependencies

const http = require('http');
const https = require('https');
const url  = require('url' );
const { StringDecoder } = require('string_decoder');
const fs = require('fs');
const config = require('./config');

// create a http server and start it
http.createServer((req , res) => {
  unifiedServer(req ,res);
})
.listen(config.httpPort, () => console.log("http Server listening on port " + config.httpPort));


let httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// create a https server and start it
https.createServer(httpsServerOptions,(req,res) =>{
  unifiedServer(req,res);
})
.listen(config.httpsPort,()=>{
 console.log("https Server listening on port "+config.httpsPort);
});


//create a unifiedServer
const unifiedServer = (req ,res) => {

  // get headers and method from request object
  let { headers , method } = req ;

  //parse the url from request object
  let parsedUrl = url.parse(req.url , true);

  //get query and pathname from parsedUrl
  let { pathname , query } = parsedUrl;

  //trim the pathname using regex
  let trimmedPath = pathname.replace(/^\/+|\/+$/g, '');


  //get payload from request , if any
  let decoder = new StringDecoder('utf-8');

  let buffer = '';
  req.on('data' , (data) => buffer += decoder.write(data));
  req.on('end' , () => {
    buffer += decoder.end();

    // Construct the data object to send to the handler
    let data = {
      'trimmedPath' : trimmedPath,
      'queryStringObject' : query,
      'method' : method.toLowerCase(),
      'headers' : headers,
      'payload' : buffer
    };

    //choose a handler from router
    let chosenHandler = router[trimmedPath] ? router[trimmedPath] : handlers.notFound;

    //route the request to chosen handler
    chosenHandler(data, (statusCode, payload) => {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof(payload) == 'object'? payload : {};

      // Convert the payload to a string
      let payloadString = JSON.stringify(payload);

      // Return the response
      res.writeHead(statusCode,{'Content-Type': 'application/json'});
      res.end(payloadString);
      console.log("Returning this response: ",statusCode,payloadString);

    });


  });

};


//define handlers
const handlers = {};

//hello handler
handlers.hello = (data , callback) => {
  callback(300 , {'welcomeMessage': 'welcome to my assignment #1'});
}
//not found handler , returns empty object
handlers.notFound = (data , callback) => {
  callback(404);
}

//define router

const router = {
  'hello' : handlers.hello
}
