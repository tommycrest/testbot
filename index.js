var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var Regex = require('regex');
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
  var nlpsense = ['/meteo in /i','/vorrei prenotare un testdrive /i','/vorrei prenotare un tavolo /i', '/ciao/i'];
  if( messages.message.text ) {

    for( var i=0; nlpsense.length; i++  ) {
      var regex = new Regex(nlpsense[i])
      if( regex.test(messages.message.text)) {
        if( i == 0 ) {
            regex = new Regex('/s(w+)$');
            var text = regex.exec(messages.message.text);
            sendMessage(messages.sender.id, {text: "Oggi a "+text+" è una bellissima giornata di sole e possiamo fare una bella scampagnata. Che ne pensi?"});
        }
        if( i == 3 ) {
            sendMessage(messages.sender.id, {text: "Ciao, piacere di ritrovarti! In cosa posso aiutarti?"});
        }
      }
    }
  }

  if( messages.message.text === ":)" ) {
    sendMessage(messages.sender.id, {text: "Welcome on Skynet Communication Inc. How we can help you?"});
  } else if( messages.message.text == "Falken" ) {
    sendMessage(messages.sender.id, {text: "Buongiorno dottor Falken. Come va oggi? Cosa ne pensa di fare un gioco?"});
  } else if( messages.message.text == "meteo" ) {
    sendMessage(messages.sender.id, {text: "Oggi il tempo è soleggiato e sereno, potrebbe essere una bella idea fare una scampagnat,non trovi?"});
  } else if( messages.message.text == "ecommerce" ||  messages.message.text == "e-commerce" ) {
    sendMessage(messages.sender.id, {text: "Benvenuto nel canale e-commerce della skynet communication. Cosa vuole acquistare?"});
  } else {
    sendMessage(messages.sender.id, {text: ">:" + messages.message.text});
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
