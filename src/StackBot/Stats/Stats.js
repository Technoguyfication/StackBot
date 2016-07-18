// keeps tracks of statistics and such

// default object
var defaultStatsObject = function () {
	return {
		messagesSeen: 0,
		questionsQueried: 0,
		commandsRun: 0,
		timestamp: Date.now()
	};
};

var Database;
module.exports.DB = function () {
	return Database;
};

// file references
const databaseFolder = process.cwd() + '/data/';
const databaseFile = databaseFolder + 'stats.json';

logger.info('Starting stats manager.');

// Save, saves stats to file
var Save = function () {
    logger.verbose('Saving database...');

    // ensure data folder exists
    try {
        fs.mkdirSync(databaseFolder);
    } catch (e) {
        logger.silly('Data folder already exists.');
    }

    // write data to new file
    fs.writeFileSync(databaseFile, JSON.stringify(Database), null, (err) => {
		if (err)
			logger.error('Error saving database: %s', err);
		
		logger.verbose('Database saved.');
	});
};
module.exports.Save = Save;	// export

// Reset, resets database
var Reset = function() {
	logger.info('Resetting database.');
	Database = defaultStatsObject;
	Save();
};
module.exports.Reset = Reset;



// try to load file otherwise default object
try {
	Database = require(databaseFile);
} catch(er) {
	logger.info('Database file did not exist, creating it now... (%s)', er.message);
	Reset();
}

// save interval
setInterval(() => {
	Save();
}, 900000); // fifteen minutes
