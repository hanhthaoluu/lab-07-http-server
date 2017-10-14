'use strict';

//npm test
const fs = require('fs');
const expect = require('expect');
const cowsay = require('cowsay');

//superagent is the tool to call my server in test codes
const request = require('superagent');

const server = require('./_server');

const PORT = 5555; //a different port than my server, so I can run my test even when my server is running; so I don't have to close my server in order to run my tests
const host = 'localhost:' + PORT;

describe('our first http server', function() {
  //in the before block, we start the test
  //run the codes in the 'before' block before any of 'it' blocks in the same 'describe'
  before(function(done) {
    server.listen(PORT, done);
  });

  //in an after block we can stop the test
  //the codes in the after block are going to be run after all the 'it' blocks are done for that 'describe' block
  after(function(done) {
    server.close(done);  //stop the server after all tests are run
  });

  it('should respond to a get request', function(done) {
    let getRequestCowSay;
    fs.readFile('./requests/getRequest.html', function(err, data) {
      if(err) throw err;
      getRequestCowSay = data; //buffer
    });

    console.log(`host :`, host);
    request
      .get(host + '/')
      .end((err, res) => {
        expect(err).toBe(null);
        expect(res.text).toBe(getRequestCowSay.toString());
        done();
      });
  });

  it('should send the response with the cow says "Hello World!"', function(done) {
    let text = 'Hello World!';
    request
      .get(host + '/cowsay?text=Hello%20World!')
      .end((err, res) => {
        expect(err).toBe(null);
        expect(res.text).toBe(`<pre>${cowsay.say({text:text})}</pre>`);
        done();
      });
  });

//post is similar to submitting a form; post does not send via url; post sends json.body

  it('should send the response with the cow says "Whats up?"', function(done) {
    let text = 'Whats up?';
    request
      .post(host + '/api/cowsay')
      .send({text: 'Whats up?'})
      .end((err, res) => {
        expect(err).toBe(null);
        expect(res.text).toBe(`{'content':'${cowsay.say( {'text':text} )}'}`);
        done();
      });
  });

  it('should error on bad JSON', function(done) {
    request
      .post(host + '/api/cowsay')
      .send('{"bad": json')
      .end((err, res) => {
        expect(err).not.toBe(null);
        expect(err.message).toBe('Bad Request');
        expect(res.text).toBe('bad json!');
        done();
      });
  });

  it('should give a 400 on a bad URL', function(done) {
    request
      .get(host + '/doesnotexist')
      .end((err, res) => {
        expect(err).not.toBe(null);
        expect(err.message).toBe('Bad Request');
        expect(res.text).toBe('bad request');

        done();
      });
  });

});
