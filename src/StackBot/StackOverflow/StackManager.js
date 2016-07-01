
var stackexchange = require('stackexchange');

function getStackQuestion(id, callback) {
	var filter = {
		key: Config.ApiKeys.StackApps,
		filter: '!-*f(6s6U8Q9b'	// body markdown and link
	}
	
	
}

function getStackQuestionID(url) {
	var qIDRegex = new RegExp('.*stackoverflow.com\/questions\/(\d+)\/');
	
	try {
		return url.match(qIDRegex)[0];
	} catch(er) {
		logger.error('Failed to parse ID from stackoverflow link: %s', er.message);
		throw;
	}
}