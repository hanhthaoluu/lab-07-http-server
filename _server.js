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
  res.write(body);
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
      console.log(text);
      text = 'I need something good to say';

    }

    sendResponse(res, 200, `<pre>${cowsay.say({text:text})}</pre>`);


  } else if (req.method === 'POST' && req.url.pathname === '/api/cowsay') {
    let body = {"content": "<cowsay cow text>"};
    req.on('data', function(data){
      body += data.toString();
    });

    req.on('end', function() {
      let json;
      try {
        json = JSON.parse(body);
      } catch(e) {
        return sendResponse(res, 400, 'bad json!');
      }
      console.log(json);
      sendResponse(res, 200, 'got the JSON');
    });
  } else {
    sendResponse(res, 400, 'bad request');
  }
});
