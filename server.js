const fs = require('fs');
const express = require("express");
const hBars  = require('express-handlebars');
const bodyParser = require('body-parser');
const qs = require('querystring');
const axios = require('axios');

const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = process.env.SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();
const { MongoClient, ObjectId } = require('mongodb')
const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const { userMentionedBot, userRegEx, setRelayChannel, relayFileParser, sendMsgToChannel } = require('./utils.js');

var db;

client.connect(err => {
  if(err) throw err;
  db = client.db('bugtrack');
});

app.use(express.static("public"));

app.engine('handlebars', hBars());
app.set('view engine', 'handlebars');

app.use('/slack_event', slackEvents.expressMiddleware());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(bodyParser.json());

slackEvents.on('message', (event) => {
  if (userRegEx.test(event.text)) {
    setRelayChannel(event, db);
  }
});

app.post("/relay_bug", (req, res) => {
  const { bugTrackId, stack} = req.body
  // relay message to correct channel.
  db.collection('users').findOne({ _id: ObjectId(bugTrackId) }, async (err, user)=>{
    if(user){
      sendMsgToChannel({token: user.slack_token, channel: user.relay_channel, text: 'test'})
        .then(slackResponse => {
          console.log(slackResponse);
        })
        .catch(err => {
          console.log(err);
        })
      
      res.end('relay successful');
    } else {
      res.end('no bugtrack user found');
    }
  });
});

app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/relay.js", (req, res) => {
  const { bugTrackId } = req.query;
  const injectIds = relayFileParser(bugTrackId);
  fs.createReadStream('./public/sw.js')
    .pipe(injectIds)
    .pipe(res);
});

app.get("/slack_auth", (req, res) => {
  console.log(process.env.CLIENT_ID);
  res.redirect(`https://slack.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20channels:history%20chat:write:bot&redirect_uri=https://bugtrack.glitch.me/slack_callback`);
});

app.get("/slack_callback", (req, res) => {
  axios.post('https://slack.com/api/oauth.access', qs.stringify({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code
  }), 
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then((response) => {
    
    const { 
      access_token, 
      user_id, 
      team_id, 
      enterprise_id, 
      team_name, 
      bot
    } = response.data;
    console.log(response.data)
    const newUser = {
      slack_token: access_token,
      user_id,
      team_id,
      enterprise_id,
      team_name,
      bot_user_id: bot.bot_user_id,
      bot_token: bot.bot_access_token,
      relay_channel: null
    };
    
    db.collection('users').findOne({user_id: user_id}, (err, user) => {
      if (err) throw (err);
      if (user) {
        console.log(user)
        res.render('about', {relayScript: `<script src='https://bugtrack.glitch.me/relay.js?bugTrackId=${user._id}'></script>`})
      } else {
        db.collection('users').insertOne(newUser);
        res.end('integration successful, thank you for installing');
      };
    });
  })
  .catch((error) => {
    console.log(error);
    res.end('error');
  });
});

app.post('/slack_event', (req,res) => {
  res.end(req.body.challenge);
});

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});


