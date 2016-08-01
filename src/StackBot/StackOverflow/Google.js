// googles things

var google = require('google');

var findSOQuestions = function(searchText, callback) {
	google.resultsPerPage = 5;	// limit this to five.
	Stats.DB().apiRequests++;
	
	// perform google search
	google(util.format('site:www.stackoverflow.com %s', searchText), (err, res) => {
		if (err) {
			return callback(err);
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
				logger.warn('Failed to sanitize StackOverflow title: %s', er.message);
				return title;
			}
		}
	});
};
module.exports.findSOQuestions = findSOQuestions;