const fetch = require('node-fetch');
const config = require('./config');
const bBotConfig = require('./birthdaybot-300521-acd941dad4f7.json');
const { auth } = require('google-auth-library');
const { google } = require('googleapis');
const { Birthday } = require('./birthday');

const _path = config.INCOMING_WEBHOOK_PATH;
const _uri = config.API_URI + _path;
const _isMock = false;

module.exports = {
    birthdayMessage,
    birthdays
};

function birthdayMessage(req, res, next) {
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
    send(botPayload, getSendError(res, next));
}

const TIMEFRAMES = {
    'day': 'DAY',
    'today': 'DAY',
    'week': 'WEEK',
    'month': 'MONTH',
    'debug': 'DEBUG'
}

async function birthdays(req, res, next) {
    const sendError = getSendError(res, next);
    const SCOPES = [
        // Other options at https://developers.google.com/identity/protocols/oauth2/scopes#docsv1
        'https://www.googleapis.com/auth/spreadsheets.readonly'
    ];
    const client = auth.fromJSON(bBotConfig);
    client.scopes = SCOPES;
    const sheets = google.sheets({version: 'v4', auth: client});
    const birthdayData = await sheets.spreadsheets.values.get({
        spreadsheetId: config.BIRTHDAY_SHEETS_ID,
        range: 'Sheet1!A2:E'
    }).catch(error => {
        if (error) {
            return sendError(error);
        }

        sendError(null, 500, {'error': 'unknown'});
    });


    if (birthdayData && birthdayData.status === 200 && birthdayData.data) {
        const birthdays = birthdayData.data.values.map((birthdayInfo) => new Birthday().deserialize(birthdayInfo)).filter((birthdayInfo) => birthdayInfo.isActive);
        if (req.method === 'GET') {
            res.status(200).send('<pre>' + birthdays.data.values.reduce((text, row) => {
                return text += row.toString() + '\n';
            }, '') + '</pre>');
        }
        if (req.method === 'POST') {
            const reqtext = req.body.text;
            const timeframe = reqtext == null || reqtext === '' ? 'DAY' : TIMEFRAMES[reqtext];
            const botPayload = {
                username: 'birthdaybot',
                channel: req.body.channel_id
            };

            console.log('birthdays, body: ', req.body)

            console.log(reqtext, timeframe/*, birthdays*/);
            switch (timeframe) {
                case 'DAY':
                    console.log(birthdays.filter(bd => bd.isToday()));
                    botPayload.text = `Birthdays today: ${birthdays.filter(bd => bd.isToday()).map(bd => bd.name).join(', ')}`;
                    break;
                case 'WEEK':
                    console.log(birthdays.filter(bd => bd.isNextWeek()));
                    botPayload.text = `Birthdays in the next week: ${birthdays.filter(bd => bd.isNextWeek()).map(bd => bd.name).join(', ')}`;
                    break;
                case 'MONTH':
                    console.log(birthdays.filter(bd => bd.isNextMonth()));
                    botPayload.text = `Birthdays in the next month: ${birthdays.filter(bd => bd.isNextMonth()).map(bd => bd.name).join(', ')}`;
                    break;
                case 'DEBUG':
                    console.log(birthdays.data.values);
                    res.status(200).send(birthdays.data.values);
                    return;
                default:
                    console.log('no valid time frame');
                    return sendError(null, 500, {'error': 'no valid time frame'});
                    break;
            }
            res.status(200).send({"message": "birthdays post"});
            // send birthday info
            send(botPayload, getSendError(res, next));
        }
    } else {
        res.status(500).send('Unable to get birthday data');
        sendError(null, 500, {'error': ''})
    }
}

function send(payload, callback) {
    fetch(_uri, {
        method: 'post',
        body: _isMock ? payload : JSON.stringify(payload),
        headers: {'Content-Type': 'application/json'},
    }).catch((error) => {
        if (error) {
            return callback(error);
        }

        callback(null, 500, {'error': 'unknown'});
    });
}

function getSendError(res, next) {
    return (error, status, body) => {
        console.log(error, status, body);
        if (error) {
            return next(error);
        } else if (status !== 200) {
            // inform user that our Incoming WebHook failed
            return next(new Error('Incoming WebHook: ' + status + ' ' + body));
        } else {
            return res.status(200).end();
        }
};
}