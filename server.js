const express = require("express");
const bodyParser = require('body-parser');
const qs = require('querystring');

const MongoClient = require('mongodb').MongoClient;

const axios = require('axios');
const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = process.env.SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();
const uri = 'mongodb+srv://admin:root@cluster0-vucd7.mongodb.net/test?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true });

let db;

client.connect(err => {
  if(err) throw err;
  db = client.db('bugtrack')
  client.close();
});

app.use(express.static("public"));

app.use('/slack_event', slackEvents.expressMiddleware());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});

app.post("/relay_bug", (req, res) => {
  console.log(req.body);
  res.end('');
});

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/sw", (req, res) => {
  res.sendFile(__dirname + "/public/sw.js");
});

app.get("/slack_auth", (req, res)=>{
  console.log(process.env.CLIENT_ID);
  res.redirect(`https://slack.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20channels:history%20chat:write:bot&redirect_uri=https://time-waterlily.glitch.me/slack_callback`);
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
  .then(async function (response) {
    const { access_token, user_id, team_id, enterprise_id, team_name, bot } = response.data;
    const newUser = {
      slack_token: access_token,
      user_id,
      team_id,
      enterprise_id,
      team_name,
      bot_user_id: bot.bot_user_id,
      bot_token: bot.access_token
    };
    
    const existingUser = await db.collection('users').findOne({user_id: user_id});
    
    console.log(existingUser)
    
    res.end('');
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



