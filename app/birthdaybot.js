const fetch = require('node-fetch');
const config = require('./config');

const _path = config.INCOMING_WEBHOOK_PATH;
const _uri = config.API_URI + _path;
const _isMock = false;

module.exports = {
    handlePost: function (req, res, next) {
        const botPayload = {
            username: 'birthdaybot',
            channel: req.body.channel_id
        };

        console.log('handlePost, body: ', req.body)

        // Check token, reject if wrong
        if (req.body.token !== config.TOKEN) {
            res.status(401).send('Invalid authorization to access this bot');
            return false;
        }

        botPayload.text = '*****';

        console.log(req.body.user_name, ' - ', req.body.text);

        // send birthday info
        send(botPayload, sendError);
    }
};

async function send(payload, callback) {
    const response = await fetch(_uri, {
        method: 'post',
        body: _isMock ? payload : JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
    }).catch((error) => {
        if (error) {
            return callback(error);
        }

        // callback(null, response.statusCode, body);
    });
}

function sendError(error, status, body) {
    if (error) {
        return next(error);
    } else if (status !== 200) {
        // inform user that our Incoming WebHook failed
        return next(new Error('Incoming WebHook: ' + status + ' ' + body));
    } else {
        return res.status(200).end();
    }
}