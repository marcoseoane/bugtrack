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

app.post('/slack', (req,res)=>{
  console.log(req)
  res.end()
})

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
