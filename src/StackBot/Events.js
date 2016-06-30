// Event handler. Does stuff with events.

var CommandManager = require('./Commands/CommandManager.js');

// ready
BotClient.on('ready', () => {
	global.Messages = require('./Tools/Messages.js');
	logger.info('StackBot is ready!');
});

// message
BotClient.on('message', (msg) => {
	Stats.DB().messagesSeen++;	// increment messages seen
	
	//if the user is a bot, reject message
	if (msg.author.bot)
		return;
	
	// if the user is stackbot
	if (msg.author.equals(BotClient.user))
		return;
	
	// if the message was a command, reject message because the command handler already dealt with it
	if (CommandManager(msg))
		return;
	
	function logMessage(msg) {
		if (msg.channel.server)
			logger.info('[Message: (%s/%s) (%s/%s)] (%s/%s) >> %s', msg.channel.server.name, msg.channel.name, msg.channel.server.id, msg.channel.id, msg.author.name, msg.author.id, msg.content);
		else
			logger.info('[Private Message: (%s/%s) >> %s', msg.author.name, msg.author.id, msg.content);
	}
	
	logMessage(msg);
});