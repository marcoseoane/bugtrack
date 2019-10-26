const express = require("express");
const bodyParser = require('body-parser');
const qs = require('querystring');
const axios = require('axios');
const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = process.env.SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

const app = express();

app.use(express.static("public"));
app.use(slackEvents.requestListener());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

slackEvents.on('message', (event) => {
  console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
});


app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/slack_auth", (req, res)=>{
  console.log(process.env.CLIENT_ID)
  res.redirect(`https://slack.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=bot%20channels:read%20chat:write:bot&redirect_uri=https://time-waterlily.glitch.me/slack_callback`);
});

app.get("/slack_callback", (req, res)=>{
  axios.post('https://slack.com/api/oauth.access', qs.stringify({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: req.query.code
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(function (response) {
    console.log(response.data);
    res.end('');
  })
  .catch(function (error) {
    console.log(error);
    res.end('error');
  });
});

app.post('/slack_challenge', (req,res)=>{
  res.end(req.body.challenge);
});

const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
