// messages. sends and logs messages

function Normal(channel, message, callback) {
	var invisCharacter = "\u200B";
	
	BotClient.sendMessage(channel, util.format('%s%s', invisCharacter, message), processMessage);
	
	function processMessage(err, msg) {
		if (err) {
			logger.error('Failed to send message to channel %s: %s', channel.id, err);
			if (callback) return callback('Failed to send message: ' + err); else return;
		} else {
			logMessageSent(msg);
			if (callback) return callback(); else return;
		}
	}
}
module.exports.Normal = Normal;

function logMessageSent(msg) {
	try {
		if (msg.channel.server)
			logger.info('[SENT: (%s/%s:%s/%s) >> %s', msg.channel.server.name, msg.channel.server.id, msg.channel.name, msg.channel.id, msg.content);
		else
			logger.info('SENT DM: (%s/%s) >> %s', msg.channel.recipient.name, msg.channel.recipient.id, msg.content);
	} catch(er) {
		logger.warn('Error while logging sent message: %s', er.message);
	}
}