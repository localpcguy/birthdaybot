const config = require('./config');

module.exports = function (req, res, next) {
	const userName = req.body.user_name;
	const botPayload = {
		text : 'Hello, ' + userName + '!'
	};

	// Check token, reject if wrong
	if (req.body.token !== config.TOKEN) {
		res.status(401).send('Invalid authorization to access this bot');
		return false;
	}

	// avoid infinite loop
	if (userName !== 'slackbot') {
		return res.status(200).json(botPayload);
	} else {
		return res.status(200).end();
	}
};