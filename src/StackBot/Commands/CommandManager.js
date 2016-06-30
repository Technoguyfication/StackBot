// command manager. manages commands. yeah.

var Utility = require('./Utility.js');
var BotCommand = require('./BotCommands.js');

var processCommand = function(msg) {
	const fullCommand = msg.content.trim().toLowerCase();
	const cmd = fullCommand.split(' ')[0];
	const args = Utility.getArguments(fullCommand);
	
	// check if the message has any of the prefixes in it
	if (fullCommand.substring(0, Config.Chat.StackCommand.length) === Config.Chat.StackCommand) {				// Stack
		// stack
	} else if (fullCommand.substring(0, Config.Chat.StackListCommand) === Config.Chat.StackListCommand) {		// Stack List
		// list stack
	} else if (fullCommand.substring(0, Config.Chat.BotCommand) === Config.Chat.BotCommand) {					// Bot command
		if (BotCommands[cmd]) {
			
		}
	} else
		return false;		// no commands to be found here
};
module.exports = processCommand;
