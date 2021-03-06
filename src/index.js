/*
	The MIT License (MIT)

	Copyright (c) 2016 Hayden (Technoguyfication) Andreyka

	Permission is hereby granted, free of charge,
	to any person obtaining a copy of this software
	and associated documentation files (the "Software"),
	to deal in the Software without restriction,
	including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense,
	and/or sell copies of the Software, and to permit
	persons to whom the Software is furnished to do so,
	subject to the following conditions:

	The above copyright notice and this permission notice
	shall be included in all copies or substantial portions
	of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
	KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
	WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
	PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
	OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// try loading global modules
try {
	global.util = require('util');
	global.fs = require('fs');
	global.path = require('path');
	global.entities = new (require('html-entities').AllHtmlEntities)();
} catch (er) {
	console.error('Please ensure you have installed and updated all dependencies!\n\nError details: ' + er.message);
	process.exit(1);
}

// try loading config
try {
	global.Config = require('./cfg/config.json');
} catch (er) {
	console.error('Unable to access config file! Make sure you make a new copy named \'config.json\' inside the cfg folder!\n\nError details: ' + er.message);
	process.exit(1);
}

// try setting up logger
try {
	var winston = require('winston');
	
	if (!fs.existsSync(Config.Logging.Directory))
		fs.mkdirSync(Config.Logging.Directory);
	
	global.logger = new winston.Logger({	
		level: Config.Logging.Level,
		transports: [
			new (winston.transports.Console)(),
			new (require('winston-daily-rotate-file'))({
				filename: path.join(Config.Logging.Directory, 'stackbot-'),
				datePattern: 'yyyy-M-d.log',
				json: Config.Logging.JSON
			})
		]
	});
} catch (err) {
   console.error('Failed to initalize logger: ' + err);
   process.exit(1);
}
// try loading classes
try {
	global.Stats = require('./StackBot/Stats/Stats.js');
	global.Utility = require('./StackBot/Tools/Utility.js');
} catch(er) {
	logger.error('There was an error loading additional classes: %s', er.message);
	process.exit(1);
}

global.StackBot = require('./StackBot/StackBot.js');
