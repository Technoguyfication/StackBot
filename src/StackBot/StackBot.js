// StackBot.js is essentially a wrapper that handles the most basic funtions of the bot

var Discord = require('discord.js');

// Delcare bot
global.BotClient = new Discord.Client(Config.Bot.Parameters);

// Start events
require('./Events.js');

// Public variables
const startTime = Date.now();
module.exports.startTime = startTime;

// Start. Starts and logs in the bot.
var Start = function () {
	logger.info('StackBot is starting!');
	login(postLoginTasks);	// login, then postLoginTasks
	
	function login(callback) {
		logger.verbose('Logging in with token: %s', Config.Bot.Token);
		BotClient.loginWithToken(Config.Bot.Token, (err, token) => {
			if (err) {
				logger.error('Failed to login with token %s: %s', token, err);
				process.exit(1);
			} else
				logger.info('Login successfull.');
			
			return callback();
		});
	}
	
	function postLoginTasks() {
		// nothing to put here for now
	}
};
module.exports.Start = Start;

// Stop. Saves stats and stops the bot.
var Stop = function () {
	Stats.Save();
	logger.info('Destroying client...');
	BotClient.destroy((err) => {
		if (err)
			logger.info('Error while destroying client: %s. Shutting down.', err);
		else
			logger.info('Shutting down...');
		
		process.exit(0);
	});
};
module.exports.Stop = Stop;


// Start bot
Start();
