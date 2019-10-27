const express = require("express");
const bodyParser = require('body-parser');
const qs = require('querystring');
const MongoClient = require('mongodb').MongoClient;
const axios = require('axios');
const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = process.env.SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();
const uri = process.env.MONGO_URI
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const { userMentionedBot, userRegEx, setRelayChannel, relayFileParser } = require('./utils.js');

const fs = require('fs');

var db;

client.connect(err => {
  if(err) throw err;
  db = client.db('bugtrack');
});

app.use(express.static("public"));
app.use('/slack_event', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

slackEvents.on('message', (event) => {
  setRelayChannel(event, db);
});

app.post("/relay_bug", (req, res) => {
  console.log(req.body);
  // relay message to correct channel.
  res.end('');
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/relay.js", (req, res) => {
  fs
    .createReadStream('./public/sw.js')
    .on('end', (data)=>console.log(data))
    .pipe(res);
});

app.get("/slack_auth", (req, res)=>{
  console.log(process.env.CLIENT_ID);
  res.redirect(`https://slack.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20channels:history%20chat:write:bot&redirect_uri=https://bugtrack.glitch.me/slack_callback`);
});

app.get("/slack_callback", (req, res)=>{
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
  .then(function (response) {
    const { access_token, user_id, team_id, enterprise_id, team_name, bot } = response.data;
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
      if(err) throw err;
      if(user){
        res.end('already integrated');
      } else {
        db.collection('users').insertOne(newUser);
        res.end('integration successful, thank you for installing');
      };
    });
  })
  .catch(function (error) {
    console.log(error);
    res.end('error');
  });
});

app.post('/slack_event', (req,res)=>{
  res.end(req.body.challenge);
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});


