// stack manager parses and displays all the commands
var stackexchange = new (require('stackexchange'))({version:2.2});
var GoogleSearch = require('./Google.js');

// sends user the highest rated stack question with the highest rated answer
var getStackQuestion = function(searchText, msg) {
	logger.info('(%s/%s : %s/%s) (%s/%s) performed single stack: \'%s\'',
		
		msg.channel.server.name,
		msg.channel.server.id,
		
		msg.channel.name,
		msg.channel.id,
		
		msg.author.name,
		msg.author.id,
		
		searchText);
	
	// perform search query
	GoogleSearch.findSOQuestions(searchText, processGoogleResults);
	
	function processGoogleResults(err, searchResults) {
		if (err) {
			logger.error('Error searching Google: %s' + err);
			Messages.Normal(msg.channel, util.format('Oh no! I ran into a problem fetching questions from Stack Overflow.\n\n`%s`', err));
			return;
		}
		
		if (searchResults.length < 1) {
			logger.info('Could not find any matching Stack Overflow questions for query \'%s\'', searchText);
			Messages.Normal(msg.channel, 'Sorry, but I was unable to find a reasonable answer for your query.');
			return;
		}
		
		var question = {};	// start object with all the question info
		
		question.url = searchResults[0].url;			// set question url
		question.title = searchResults[0].title;		// set question title
		try {
			question.id = getStackQuestionID(question.url);	// set question id
		} catch (er) {
			Messages.Normal(msg.channel, 'That query returned the wrong url. Try different keywords.');
			return;
		}
		
		getStackQuestionData(question, processStackAnswers);
	}
	
	function processStackAnswers(err, question) {
		if (err) {
			logger.error('Error processing stack answers: %s', err);
			Messages.Normal(msg.channel, util.format('Sorry, but I ran into a problem fetching answers from Stack Overflow.\n\n`%s`', err));
			return;
		}
		
		if (question.answers.length < 1) {
			logger.warn('Stack Overflow question %s has no answers.', question.id);
			Messages.Normal(msg.channel, util.format('The most suitable question found (%s - %s) contained no answers. Try using %s for more options.',
				
				question.title,
				question.id,
				Config.Chat.StackListCommand));
			return;
		}
		
		sendToChat(question);
	}
	
	function sendToChat(question) {
		const finishedMessage = util.format(
			':information_source: **%s**\n\n' +
			'%s\n\n\n' +
			'**%s Points**\n\nAnswered by %s (%s reputation) at %s.\nLast edit made %s.\n\n' +
			'*Use `%s` for more options.*',
			
			question.title,
			
			entities.decode(question.answers[0].body_markdown),
			
			Utility.emojiInteger(question.answers[0].score),
			question.answers[0].owner.display_name,
			question.answers[0].owner.reputation,
			new Date(question.answers[0].creation_date * 1000).toString(),
			new Date(question.answers[0].last_activity_date * 1000).toString(),
			
			Config.Chat.StackListCommand);
		
		const backupMessage = util.format(
			'The answer I fetched for you is too big to fit into Discord. Here\'s a link to it instead:\n%s',
			question.url);
		
		Messages.Normal(msg.channel, (finishedMessage.length < 2000 ? finishedMessage : backupMessage));
	}
};
module.exports.getStackQuestion = getStackQuestion;


// Sends user a list of possible questions, then a list of possible answers, then finally an answer
var listStackQuestions = function(args) {
	
};
module.exports.listStackQuestions = listStackQuestions;

function getStackQuestionData(question, callback) {
	var filter = {
		key: Config.ApiKeys.StackApps,
		filter: '!-*f(6s6U8Q9b',	// body markdown and link
		site: 'stackoverflow.com'
	};
	
	logger.verbose('STACK: Fetching data for question %s.', question.id);
	
	stackexchange.questions.answers(filter, (err, results) => {
		if (err)
			return callback(err);
		else {
			question.answers = results.items;	// set question answers
			
			// sort answers by score
			question.answers.sort((a, b) => {
				return a - b;
			});
			
			return callback(null, question);
		}
	}, [question.id]);
}

function getStackQuestionID(url) {
	var qIDRegex = /.*stackoverflow.com\/questions\/(\d+)\//;
	
	try {
		return url.match(qIDRegex)[1];
	} catch(er) {
		logger.error('Failed to parse ID from stackoverflow link (%s): %s', url, er.message);
		throw er;
	}
}
