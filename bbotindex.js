const express = require('express');
const config = require('./app/config');
const helloBot = require('./app/hellobot');
const birthdayBot = require('./app/birthdaybot');

const app = express();
const port = config.PORT || 3020;

// body parser middleware
app.use(express.json());

// test route
app.get('/', function (req, res) { res.status(200).send('Hello world!'); });
app.post('/hello', helloBot);
app.post('/birthdays', birthdayBot.handlePost);

// error handler
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.status(400).send(err.message);
});

app.listen(port, function () {
	console.log('Slack bot listening on port ' + port);
});

module.exports = app;
