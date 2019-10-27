module.exports.userMentionedBot = (msgText, botId)=> msgText.includes(botId);
module.exports.userRegEx = /<@.*> /;
module.exports.setRelayChannel = (event, db) => {
  console.log(event.text)
  if(this.userRegEx.test(event.text)){
    const msgText = event.text.replace(this.userRegEx, '').toLowerCase();
    console.log(msgText)
    if(msgText.includes('relay'))
      db.collection('users').findOne({team_id: event.team}, (err, user)=>{
        if (err) throw (err);
        // check for message with bot's user name to set ID of channel to relay stack traces to.
        if(this.userMentionedBot(event.text, user.bot_user_id))
          console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
      });
  }
}