// server.js
// where your node app starts

// init project
const express = require("express");
const bodyParser = require('body-parser');
const app = express();

// we've started you off with Express,
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/slack_auth", (req, res)=>{
  console.log(process.env.CLIENT_ID)
  res.redirect(`https://slack.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=channels:read chat:write:bot&redirect_uri=https://time-waterlily.glitch.me/slack_callback`);
});

app.get("/slack_callback", (req, res)=>{
  console.log(req.query)
  res.end()
});

app.post('/slack_challenge', (req,res)=>{
  console.log(req.body)
  res.end(req.body.challenge)
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
