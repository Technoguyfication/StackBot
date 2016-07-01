// googles things

var google = require('google');

var findSOQuestions = function(searchText, callback) {
	logger.verbose('GOOGLE: %s', searchText);
	
	google.resultsPerPage = 5;
	
	google(util.format('site:stackoverflow.com %s', searchText), (err, res) => {
		if (err) {
			logger.warn('Failed to perform Google search query: %s', err);
			return callback(util.format('Failed to perform search query: %s', err));
		}
		
		var soQuestions = [];
		
		res.links.forEach((link, index, array) => {
			soQuestions.push({'title': sanitizeTitle(link.title), 'url': link.href});
		});
		
		return callback(null, soQuestions);
		
		function sanitizeTitle (title) {
			const stackoverflowSuffix = " - Stack Overflow";
			
			try {
				return title.substring(0, (title.length - stackoverflowSuffix.length));
			} catch(er) {
				logger.error('Failed to sanitize StackOverflow title! Has the format changed?');
				return title;
			}
		}
	});
};
module.exports.findSOQuestions = findSOQuestions;