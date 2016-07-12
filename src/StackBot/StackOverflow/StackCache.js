var cache = {};

function Add(message, _searchResults) {
	try {
		cache[message.author.id][message.channel.id] = {
			searchResults: _searchResults,
			timestamp: Date.now()
		};
	} catch(er) {
		logger.warn('Error whilst adding data to search cache: %s\n\nStacktrace:\n%s', er.message, er.stack);
	}
}

module.exports.Cache = cache;
module.exports.Add = Add;

// clean up cache every 5 minutes
setInterval(() => {
	const purgeTime = 300000;
	
	logger.debug('Cleaning up search cache..');
	var deletedEntries = 0;
	for (var user in cache) {
		for (var channel in cache[user]) {
			if (cache[user][channel].timestamp < Date.now() - purgeTime) {
				delete cache[user][channel];
				deletedEntries++;
			}
		}
	}
	logger.verbose('Cleaned %s entries from search cache.', deletedEntries);
}, 300000);
