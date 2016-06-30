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
    logger.verbose('Saving statistics...');

    // ensure data folder exists
    try {
        fs.mkdirSync(databaseFolder);
    } catch (e) {
        logger.silly('Data folder already exists.');
    }

    // write data to new file
    fs.writeFileSync(databaseFile, JSON.stringify(Database), null, (err) => {
		if (err)
			logger.error('Error saving stats file: %s', err);
		
		logger.verbose('Done saving statistics..');
	});
};
module.exports.Save = Save;	// export


// try to load file otherwise default object
try {
	Database = require(databaseFile);
} catch(er) {
	logger.info('Stats file did not exist, creating it now... (%s)', er.message);
	Database = defaultStatsObject();
	Save();
}

// save interval
setInterval(() => {
	Save();
}, 900000); // fifteen minutes