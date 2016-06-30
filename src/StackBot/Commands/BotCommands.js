module.exports =
{
	'stop': {
		'owner': true,
		'help': 'Stops StackBot.\n\n `Usage`\n```None```',
		'run': (args, msg) => {
			Messages.Normal(msg.channel, 'StackBot is stopping.', (err) => {
				StackBot.Stop();
			});
		}
	},
	'eval': {
		'owner': true,
		'help': 'Evaluates any valid JavaScript statement.\n\n `Usage`\n```eval (statement)```',
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
	'info': {
		'owner': false,
		'help': 'Information about StackBot.\n\n `Usage`\n```None```',
		'run': (args, msg) => {
			
		}
	},
	'stats': {
		'owner': false,
		'help': 'Shows session and lifetime statistics for StackBot.\n\n `Usage`\n```None```',
		'run': (args, msg) => {
			
		}
		
	}
};