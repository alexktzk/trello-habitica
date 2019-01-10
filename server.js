// server.js
// where your node app starts

var compression = require('compression');
var cors = require('cors');
var express = require('express');
var nocache = require('node-nocache');

var app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));

// https://github.com/mingchen/node-nocache
app.use('/manifest.json', nocache, function (request, response) {
  response.sendFile(__dirname + '/public/manifest.json');
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

