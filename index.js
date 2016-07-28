var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

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
