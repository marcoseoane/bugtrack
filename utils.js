module.exports.userMentionedBot = (msgText, botId)=> msgText.includes(botId);
module.exports.userRegEx = /<@.*> /;