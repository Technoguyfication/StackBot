var commandList = {
	'stop': {
		'owner': true,
		'help': 'Stops StackBot.',
		'usage': 'None',
		'run': (args, msg) => {
			Messages.Normal(msg.channel, 'StackBot is stopping.', (err) => {
				StackBot.Stop();
			});
		}
	},
	'eval': {
		'owner': true,
		'help': 'Evaluates any valid JavaScript statement.',
		'usage': 'eval (statement)',
		'run': (args, msg) => {
			var startTime = Date.now();
			var evalResponse;
			
			try {
				evalResponse = eval(args);	// jshint ignore: line
			} catch(er) {
				logger.warn('Error while evaluating "%s": %s', args, er.message);
				Messages.Normal(msg.channel, util.format('There was an error evaluating your statement.\n\n``` %s```', er.message));
				return;
			}
			
			Messages.Normal(msg.channel, util.format('Evaluated `%s`\n\n `Output`\n```%s ```\n\n*Took %sms to evaluate your statement*', args, evalResponse, (Date.now() - startTime)));
		}
	},
	'help': {
		'owner': false,
		'help': 'Displays a list of commands or help on a specific command.',
		'usage': 'help [command]',
		'run': (args, msg) => {
			if (args) {		// are we getting help for a specific command?
				if (commandList[args]) {	// if command exists
					if (commandList[args].help) {	// if help information exists
						Messages.Normal(msg.channel, util.format('Help topic: `%s`\n\n%s\n\n `Usage`\n```%s```', args, commandList[args].help, (commandList[args].usage ? commandList[args].usage : 'No usage information available.')));
					} else
						Messages.Normal(msg.channel, util.format('Could not find help topic for command `%s`', args));
				} else	// Command does not exist
					Messages.Normal(msg.channel, util.format(':negative_squared_cross_mark:  That command does not exist! Do %shelp for a list of commands.', Config.Chat.BotCommand));
			} else {
				var helpCommands = new Array();
				
				// populate array of commands to display help for
				for (var command in commandList) {
					if (!commandList[command].owner)
						helpCommands.push({
							'name': command,
							'command': commandList[command]
						});
				}
				
				var longestCommandLength = 0;
				
				// find longest command name
				helpCommands.forEach((command, index, array) => {
					if (command.name.length > longestCommandLength)
						longestCommandLength = command.name.length;
				});
				
				var helpBlock = "";
				
				// generate list of things
				helpCommands.forEach((command, index, array) => {
					helpBlock = util.format('%s\n`%s`%s%s',
					
					helpBlock,
					command.name,
					new Array(5 + (longestCommandLength - command.name.length)).join(' '),	// create a length of blank space to fill the gap
					command.command.help);
				});
				
				Messages.Normal(msg.channel, util.format(
					'Hello, I\'m StackBot, and here\'s my list of commands:\n\n' +
					'`%s(StackOverflow Query)` to grab a question and answer from StackOverflow.\n' +
					'`%s(StackOverflow Query)` does the same as `%s` but lists available questions.\n\n' +
					'**Append `%s` to front of the following commands:**\n' +
					'%s\n\n' +
					'*A webpage for contact information, support, and other details is coming soon.*',
					
					Config.Chat.StackCommand,
					Config.Chat.StackListCommand,
					Config.Chat.StackCommand,
					Config.Chat.BotCommand,
					helpBlock));
			}
		}
	},
	'info': {
		'owner': false,
		'help': 'Information about StackBot.',
		'usage': 'None',
		'run': (args, msg) => {
			
		}
	},
	'stats': {
		'owner': false,
		'help': 'Shows session and lifetime statistics for StackBot.',
		'usage': 'None',
		'run': (args, msg) => {
			Messages.Normal(msg.channel, util.format(
				" `Global Statistics`\n```xl\n" +
				"                           Uptime: %s\n" +
				"                    Messages Seen: %s\n" +
				"StackOverflow Questions Processed: %s\n" +
				"               Commands Processed: %s\n" +
				"                Connected Servers: %s\n" +
				"                    Visible Users: %s\n" +
				"```\n*This data period started on %s.*", 
				
				Utility.msToString(Date.now() - StackBot.startTime),
				
				Stats.DB().messagesSeen,			// Messages seen
				Stats.DB().questionsQueried,		// Questions processed
				Stats.DB().commandsRun,				// Commands processed
				
				BotClient.servers.length,			// servers running on
				BotClient.users.length,				// users visible
				new Date(Stats.DB().timestamp).toString()));
		}
	},
	'invite': {
		'owner': false,
		'help': 'Invite StackBot to your own server.',
		'usage': 'None',
		'run': (args, msg) => {
			
		}
	}
};
module.exports = commandList;
