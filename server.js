// server.js
// where your node app starts

let compression = require('compression');
let cors = require('cors');
let express = require('express');

let app = express();

// compress our client side content before sending it over the wire
app.use(compression());

// your manifest must have appropriate CORS headers, you could also use '*'
app.use(cors({ origin: 'https://trello.com' }));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('dist'));

// listen for requests :)
let listener = app.listen(8080, () => {
  console.info(`Node Version: ${process.version}`);
  console.log('Trello Power-Up Server listening on port ' + listener.address().port);
});
