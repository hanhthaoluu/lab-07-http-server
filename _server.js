'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const querystring = require('querystring');
const cowsay = require('cowsay');

let getRequestCowSay = '';
fs.readFile('./requests/getRequest.html', function(err, data) {
  if(err) throw err;
  getRequestCowSay = data;
});

let sendResponse = function(res, status, body) {
  res.writeHead(status, {'Content-Type': 'text/html'});
  res.write(body); //res.text in test.js
  res.end();
};

const server = module.exports = http.createServer((req, res) => {
  req.url = url.parse(req.url);
  if (req.method === 'GET' && req.url.pathname === '/') {
    sendResponse(res, 200, getRequestCowSay);
  } else if (req.method === 'GET' && req.url.pathname === '/cowsay') {
    let parsedQueryString = querystring.parse(req.url.query);
    let text = parsedQueryString.text;

    if((text === '') || (text === undefined)) {
      text = 'I need something good to say';
    }

    sendResponse(res, 200, `<pre>${cowsay.say({text:text})}</pre>`);

  } else if (req.method === 'POST' && req.url.pathname === '/api/cowsay') {
    //post is similar to submitting a form; post does not send via url; post sends json.body
    //in terminal, run this command:  echo '{"text": "hello"}' | http localhost:3000/api/cowsay
    let body = '';
    req.on('data', function(data){
      body += data.toString();
      if ( (body === '') || (body === undefined) ){
        sendResponse(res, 400, {'error': 'invalid request: text query required'});
      }
    });

    req.on('end', function() {
      let json;
      try {
        json = JSON.parse(body);
      } catch(e) {
        return sendResponse(res, 400, 'bad json!');
      }
      console.log(json);
      let text = json.text;
      if( (text === '') || (text === undefined) ) {
        sendResponse(res, 400, `{'error': 'invalid request: text query required'}`);
      } else {
        sendResponse(res, 200, `{'content':'${cowsay.say( {'text':text} )}'}`);
      }
    });
  } else {
    sendResponse(res, 400, 'bad request');
  }
});


//_server.js ..._ underscore denotes internal api, meant to be used by other pieces of node, meant to be internally used rather than like run as a file
