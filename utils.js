const Transform = require('stream').Transform;

module.exports.userMentionedBot = (msgText, botId) => msgText.includes(botId);
module.exports.userRegEx = /<@.*> /;
module.exports.setRelayChannel = (event, db) => {
  if (this.userRegEx.test(event.text)) {
    const msgContent = event.text.replace(this.userRegEx, '').toLowerCase();
    if (msgContent.includes('relay'))
      db.collection('users').findOne({ team_id: event.team }, (err, user) => {
        if (err) throw (err);
        // check for message with bot's user name to set ID of channel to relay stack traces to.
        if (this.userMentionedBot(event.text, user.bot_user_id))
          db.collection('users').updateOne({ user_id: user.user_id }, { $set: { relay_channel: event.channel } }, (err, res) => {
            console.log(res);
            console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
          });
      });
  };
};
module.exports.relayFileParser = (botId, channelId) => {
  const t = new Transform();
  t._transform = function(data, encoding, done) {
    const str = data.toString().replace("bugBotId: ''", "bugBotId: '"+ botId +"'").replace("channelId: ''", "channelId: '"+ channelId +"'");
    this.push(str);
    done();
  };
  return t
};
module.exports.sendMsgToChannel = () => {}