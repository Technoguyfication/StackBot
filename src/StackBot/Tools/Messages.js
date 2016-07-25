// messages. sends and logs messages

const invisCharacter = "\u200B";

function Normal(channel, message, callback) {
	BotClient.sendMessage(channel, util.format('%s%s', invisCharacter, message), processMessage);
	
	function processMessage(err, msg) {
		if (err) {
			logger.error('Failed to send message to channel %s: %s', channel.id, err);
			if (callback) return callback('Failed to send message: ' + err); else return;
		}
			
		logMessageSent(msg);
		if (callback) return callback(null, msg); else return;
	}
}
module.exports.Normal = Normal;

function Await(msg, prompt, callback) {
	BotClient.awaitResponse(message, prompt, processResponse);
	
	function processResponse(err, _msg) {
		if (err) {
			logger.error('Failed to send awaitresponse message: %s', err);
			if (callback) return callback('Failed to send message: ' + err); else return;
		}
		
		logger.info('[SENT AWAIT: (%s/%s : %s/%s)] >> %s', msg.channel.server.name, msg.channel.server.id, msg.channel.name, msg.channel.id, prompt);
		if (callback) return callback(null, _msg); else return;
	}
}
module.exports.Await = Await;

function logMessageSent(msg) {
	try {
		if (msg.channel.server)
			logger.info('[SENT: (%s/%s : %s/%s) >> %s', msg.channel.server.name, msg.channel.server.id, msg.channel.name, msg.channel.id, msg.content);
		else
			logger.info('SENT DM: (%s/%s) >> %s', msg.channel.recipient.name, msg.channel.recipient.id, msg.content);
	} catch(er) {
		logger.warn('Error while logging sent message: %s', er.message);
	}
}