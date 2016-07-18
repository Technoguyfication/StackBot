// Event handler. Does stuff with events.

var CommandManager = require('./Commands/CommandManager.js');

// ready
BotClient.on('ready', () => {
	global.Messages = require('./Tools/Messages.js');
	logger.info('StackBot is ready!');
	logger.info('Running on %s servers, %s channels, and with %s unique users.',
			BotClient.servers.length, BotClient.channels.length, BotClient.users.length);
});

// message
BotClient.on('message', (msg) => {
	Stats.DB().messagesSeen++;	// increment messages seen
	
	//if the user is a bot, reject message
	if (msg.author.bot)
		return;
	
	// if the user is stackbot, reject message
	if (msg.author.equals(BotClient.user))
		return;
	
	// if the message was a command, reject message because the command handler already dealt with it
	if (CommandManager(msg))
		return;
	
	// if the message hasn't been rejected yet it's probably a chat message so log it
	function logMessage(msg) {
		logger.info('MSG: %s >> %s', Utility.messageInfoString(msg), msg.content);
	}
	
	logMessage(msg);	// log the shit mate
});
