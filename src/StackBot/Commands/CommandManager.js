// command manager. manages commands. yeah.

var Utility = require('./Utility.js');
var BotCommands = require('./BotCommands.js');

var processCommand = function(msg) {
	// check if the message has any of the prefixes in it
	if (msg.content.toLowerCase().substring(0, Config.Chat.StackCommand.length) === Config.Chat.StackCommand) {						// Stack
		return true;
	} else if (msg.content.toLowerCase().substring(0, Config.Chat.StackListCommand.length) === Config.Chat.StackListCommand) {		// Stack List
		return true;
	} else if (msg.content.toLowerCase().substring(0, Config.Chat.BotCommand.length) === Config.Chat.BotCommand) {					// Bot command
		const cmd = msg.content.split(' ')[1].toLowerCase();
		var args = null;
		
		if (Utility.getArguments(msg.content).indexOf(' ') > -1)
			args = Utility.getArguments(Utility.getArguments(msg.content));
		
		if (BotCommands[cmd] != (undefined||null)) {
			if ((BotCommands[cmd].owner && Config.Permissions.Owners.indexOf(msg.author.id) > -1) || !BotCommands[cmd].owner) {
				logger.info('(%s/%s) issued bot command \'%s\' with args \'%s\'', msg.author.name, msg.author.id, cmd, args);
				try {
					BotCommands[cmd].run(args, msg);
				} catch(er) {
					logger.warn('(%s/%s) triggered an uncaught error when running command \'%s\' with args \'%s\': %s', msg.author.name, msg.author.id, cmd, args, er.message);
					Messages.Normal(msg.channel, 'Woah! Seems like you triggered an uncaught exception running that command. Try not to do it again.');
				}
			} else {	// user is denied access
				logger.info('(%s/%s) was denied access to command \'%s\' with args \'%s\'', msg.author.name. msg.author.id, cmd, args);
				Messages.Normal(msg.channel, util.format(':no_entry: Access Denied :no_entry:\n\nYou are unable to use the command `%s`', cmd));
			}
		} else
			Messages.Normal(msg.channel, util.format('For usage and information, use `%s help`', Config.Chat.BotCommand));
		
		return true;
	} else
		return false;		// no commands to be found here
};
module.exports = processCommand;
