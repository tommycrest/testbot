var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var Regex = require('regex');
var app = express();

const WIT_TOKEN = process.env.WIT_TOKEN;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server Heroku prima pagina per avere
// la conferma di onlline della applicazione backend
app.get('/', function (req, res) {
    res.send('TestBot Server of Skynet Communication Inc.');
});

// Facebook Webhook seconda get per facebook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Verify Token non corretto');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
          skynetBrain(event);
          //sendMessage(event.sender.id, {text: "Echo: " + event.message.text});
        }
      }
    res.sendStatus(200);
});

function skynetBrain(messages) {
  if( messages.message.text === ":)" ) {
    sendMessage(messages.sender.id, {text: "Welcome on Skynet Communication Inc. How we can help you?"});
  } else {
    //only echo messages from heroku bot application
    //future integration will be held from Wit.Ai
    var witresponse = sendWitMessage(messages.message.text);
    console.log(witresponse);

    sendMessage(messages.sender.id, {text: ">:" + sendWitMessage(messages.message.text)});
  }
}

// generic function sending messages
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};


// generic function sending messages
function sendWitMessage(message) {
    request({
        url: 'https://api.wit.ai/message?v=20160728&q=',
        qs: {access_token: process.env.WIT_TOKEN},
        method: 'POST',
        json: {
            //recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};
