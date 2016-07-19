// stack manager parses and displays all the commands
var stackexchange = new (require('stackexchange'))({version:2.2});
var GoogleSearch = require('./Google.js');
var StackCache = require('./StackCache.js');

// sends user the highest rated stack question with the highest rated answer
var getStackQuestion = function(searchText, msg) {
	logger.info('%s stack with query \'%s\'', Utility.messageInfoString(msg), searchText);
	
	// perform search query
	GoogleSearch.findSOQuestions(searchText, processGoogleResults);
	
	function processGoogleResults(err, searchResults) {
		if (err) {
			logger.error('Error searching Google: %s' + err);
			Messages.Normal(msg.channel, util.format('Oh no! I ran into a problem fetching questions from Stack Overflow.\n\n`%s`', err));
			return;
		}
		
		if (searchResults.length < 1) {	// no matching queries
			logger.info('Could not find any matching Stack Overflow questions for query \'%s\'', searchText);
			Messages.Normal(msg.channel, 'Sorry, but I was unable to find a reasonable answer for your query. Try different keywords.');
			return;
		}
		
		StackCache.Add(msg, searchResults);
		
		var question = {
			url: searchResults[0].url,		// set question url
			title: searchResults[0].title	// set question title
		};
		
		try {
			question.id = getStackQuestionID(question.url);	// set question id
		} catch (er) {
			Messages.Normal(msg.channel, 'That query returned an invalid URL (Meta page?)\nTry using different wording.');
			return;
		}
		
		getStackQuestionData(question, processStackAnswers);	// fetch data from stackoverflow
	}
	
	//function getById 
	function processStackAnswers(err, question) {
		if (err) {
			logger.error('Error fetching stack answers: %s', err);
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
		
		sendToChat(question.title, question.answers[0], question.url, msg);
	}
};
module.exports.getStackQuestion = getStackQuestion;

var moreStackQuestions = function(msg) {
	// user has never initiated stack command (since bot startup)
	if (StackCache.Cache[msg.author.id][msg.channel.id] == (undefined||null)) {
		Messages.Normal(msg.channel, util.format('You haven\'t used `%s` recently. Use `%shelp` for details.', Config.Chat.StackCommand.trim(), Config.Chat.BotCommand.trim()));
		return;
	}
	
	// user has not initiated stack command in the last x milliseconds
	if (StackCache.Cache[msg.author.id][msg.channel.id].timestamp < (Date.now() - StackCache.validTime)) {
		Messages.Normal(msg.channel, util.format('You haven\'t used `%s` in this channel in the last %s.', Config.Chat.StackCommand.trim(), Utility.msToString(StackCache.validTime)));
		return;
	}
};
module.exports.moreStackQuestions = moreStackQuestions;

// post question data in chat
function sendToChat(title, answer, url, msg) {
		const finishedMessage = util.format(
			'**%s**\n' +
			'<%s>\n\n' +
			'```%s```\n' +
			'**%s Points**\n\nAnswered by **%s** (%s) %s ago.%s\n\n' +
			'*Use `%s` for more options.*  **Note: It is not recommended to copy/paste code snippets from this message.**',
			
			title,
			url,
			
			entities.decode(answer.body_markdown).replace('\'\'\'', '\''),	// replace ''' with '
			
			Utility.emojiInteger(answer.score),
			answer.owner.display_name,
			answer.owner.reputation,
			Utility.msToString(answer.creation_date),
			(answer.last_edit_date ? '' : util.format('\nLast edit made %s ago.', Utility.msToString(answer.last_edit_date))),
						
			Config.Chat.StackListCommand);
		
		const backupMessage = util.format(
			'The answer I fetched for you is too big to fit into Discord. Here\'s a link to it instead:\n<%s>',
			url);
		
		Messages.Normal(msg.channel, (finishedMessage.length < 2000 ? finishedMessage : backupMessage));
	}

// Sends user a list of possible questions, then a list of possible answers, then finally an answer
var listStackQuestions = function(args) {
	
};
module.exports.listStackQuestions = listStackQuestions;

// fetch data from stackoverflow based on question id
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
				return a.score - b.score;
			});
			
			question.answers.reverse();
			
			return callback(null, question);
		}
	}, [question.id]);
}

function getStackQuestionID(url) {
	var qIDRegex = /.*stackoverflow.com\/questions\/(\d+)\//;
	
	try {
		return url.toLowerCase().match(qIDRegex)[1];
	} catch(er) {
		logger.error('Failed to parse ID from stackoverflow link (%s): %s', url, er.message);
		throw er;
	}
}
