'use strict';

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const logger = require('morgan');
const router = express.Router();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(logger('dev'));

app.get('/', (req, res) => {
    res.writeHead(200, {'Content-Type' : 'text/html'});
    res.end('The API can be found <a href=\'/api/v1\'>here</a>');
})
require('./routes')(router);
app.use('/api/v1', router);

app.listen(port);
console.log(`App running on ${port}`);
