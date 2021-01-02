const express = require('express');
const config = require('./app/config');
const helloBot = require('./app/hellobot');
const birthdayBot = require('./app/birthdaybot');

const app = express();
const port = config.PORT || 3020;

// body parser middleware
app.use(express.json());

// routes
app.get('/', (req, res) => res.status(200).send('Hello world! -BBot'));
app.get('/birthdays', birthdayBot.birthdays);
app.post('/hello', helloBot);
app.post('/birthdays', birthdayBot.birthdays);
app.post('/postBirthday', birthdayBot.birthdayMessage);

// error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(400).send(err.message);
});

app.listen(port, () => console.log('Slack bot listening on port ' + port));

module.exports = app;
