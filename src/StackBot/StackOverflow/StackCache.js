var cache = {};
const validTime = 300000;

function Add(message, searchResults) {
	try {
		cache[message.author.id][message.channel.id] = {
			searchResults: searchResults,
			timestamp: Date.now()
		};
	} catch(er) {
		logger.warn('Error whilst adding data to search cache: %s\n\nStacktrace:\n%s', er.message, er.stack);
	}
}

module.exports.Cache = cache;
module.exports.Add = Add;
module.exports.validTime = validTime;

// clean up cache every 5 minutes
setInterval(() => {
	logger.debug('Cleaning up search cache..');
	var deletedEntries = 0;
	for (var user in cache) {
		for (var channel in cache[user]) {
			if (cache[user][channel].timestamp < Date.now() - validTime) {
				delete cache[user][channel];
				deletedEntries++;
			}
		}
	}
	logger.verbose('Cleaned %s entries from search cache.', deletedEntries);
}, 300000);
