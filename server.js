// server.js
// where your node app starts

let compression = require('compression');
let cors = require('cors');
let express = require('express');
let nocache = require('node-nocache');

let app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));

// https://github.com/mingchen/node-nocache
app.use('/manifest.json', nocache, (request, response) => {
  response.sendFile(__dirname + '/public/manifest.json');
});

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// listen for requests :)
let listener = app.listen(process.env.PORT, () => {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});

