#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var path = require('path');

var port = 8000;

var server = http.createServer(function(request, response) {
  console.log('request starting...');

  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = './index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
    case '.wav':
      contentType = 'audio/wav';
      break;
  }

  fs.readFile(filePath, function(error, content) {
    if (error) {
      if (error.code == 'ENOENT') {
        response.writeHead(404);
        response.end('404 - File not found', 'utf-8');
      } else {
        response.writeHead(500);
        response.end('500 - server error : ' + error.code + ' ..\n');
        response.end();
      }
    } else {
      response.writeHead(200, {
        'Content-Type': contentType
      });
      response.end(content, 'utf-8');
    }
  });

}).listen(port);

console.log('server started on port ' + port);

var clients = [];

var ws = new WebSocketServer({
  httpServer: server
});
ws.on("request", function(e) {
  var connection = e.accept(null, e.origin);
  var nom = new Date().getTime();
  console.log("new Client : " + nom);
  clients[nom] = {
    "connection": connection,
    "role": ""
  };

  connection.on('message', function(message) {
    for (var name in clients) {
      clients[name].connection.send(message.utf8Data);
    }
  });

  connection.on('close', function(connection) {
    console.log("la connection " + connection + " a quitté");
  });
});
