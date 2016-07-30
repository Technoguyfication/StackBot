// stack manager parses and displays all the commands
var stackexchange = new (require('stackexchange'))({version:2.2});
var GoogleSearch = require('./Google.js');
var StackCache = require('./StackCache.js');

// sends user the highest rated stack question with the highest rated answer
var getStackQuestion = function(searchText, msg) {
	logger.info('%s stack with query \'%s\'', Utility.messageInfoString(msg), searchText);
	
	if (!isNaN(searchText)) {
		const stackUrlTemplate = 'http://stackoverflow.com/questions/%s';
		getStackQuestionData({ url: util.format(stackUrlTemplate, searchText), title: util.format('Question ID: %s', searchText), id: parseInt(searchText)}, processStackAnswers); 
	} else {
		// perform search query
		GoogleSearch.findSOQuestions(searchText, processGoogleResults);
	}
	
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
			Messages.Normal(msg.channel, util.format('The most suitable question found (%s - %s) contained no answers. Try using `%s` for more options.',
				
				question.title,
				question.id,
				Config.Chat.StackListCommand));
			return;
		}
		
		sendToChat({
			title: question.title,
			answer: question.answers[0],
			url: question.url,
		}, msg);
	}
};
module.exports.getStackQuestion = getStackQuestion;

var moreStackQuestions = function(msg) {
	// if there's not a user object in the cache make it now
	if (StackCache.Cache()[msg.author.id] == (undefined||null)) {
		logger.verbose('Creating user entry in stack cache for %s (%s)', msg.author.name, msg.author.id);
		StackCache.Cache()[msg.author.id] = {};
	}
	
	// user has never initiated stack command (since bot startup)
	if (StackCache.Cache()[msg.author.id][msg.channel.id] == (undefined||null)) {
		Messages.Normal(msg.channel, util.format('You haven\'t used `%s` recently. Use `%shelp` for details.', Config.Chat.StackCommand.trim(), Config.Chat.BotCommand));
		return;
	}
	
	// user has not initiated stack command in the last x milliseconds
	if (StackCache.Cache()[msg.author.id][msg.channel.id].timestamp < (Date.now() - StackCache.validTime)) {
		Messages.Normal(msg.channel, util.format('You haven\'t used `%s` in this channel in the last %s.', Config.Chat.StackCommand.trim(), Utility.msToString(StackCache.validTime)));
		return;
	}
	
	// TODO: add support for getting more answers if you previously searched by question ID
	displayPossibleQuestions();
	
	// display possible questions from google
	function displayPossibleQuestions() {
		const questionEntryTemplate = '**[%s]** *%s*\n';
		const cacheObject = StackCache.Cache()[msg.author.id][msg.channel.id];
		
		var questionBlock = '';	// init string so we don't get undefined crap everywhere
		
		cacheObject.searchResults.forEach((result, index, array) => {
			questionBlock += util.format(questionEntryTemplate, (index + 1), result.title);
		});
		
		const messageTemplate = 'Here\'s a list of the possible questions I found:\n\n' +
			'%s\n\n' +
			'Please type the **number** of the question you want to select.\n' +
			'(The number inside the boxes)';
		
		// send prompt for user to select question
		Messages.Await(msg, util.format(messageTemplate, questionBlock), (err, _msg) => {
			if (err) {
				logger.error('Error sending question selection prompt: %s', err);
				Messages.Normal(msg.channel, 'There was a problem sending you the message prompt. Try again?');
				return;
			}
			
			var selection = _msg.content.trim();
			
			//user response was not a number
			if (isNaN(selection)) {
				Messages.Normal(msg.channel, 'You did not enter a valid selection. Aborting.');
				return;
			}
			
			const searchIndex = (selection - 1);
			
			// number was not part of list
			try {
				if (cacheObject.searchResults[searchIndex] === (undefined||null)) {
					Messages.Normal(msg.channel, 'That number was not a valid selection.');
					return;
				}
			} catch (er) {
				logger.verbose('%s\n\n%s', er.message, er.stack);
				Messages.Normal(msg.channel, 'That number was not a valid selection. Please enter ONLY an integer number.');
				return;
			}
			
			// build question object
			var question = {
				url: cacheObject.searchResults[searchIndex].url,
				title: cacheObject.searchresults[searchIndex].title,
				id: getStackQuestionID(cacheObject.searchResults[searchIndex].url)
			};
			
			getStackQuestionData(question, displayPossibleAnswers);
		});
	}
	
	// display possible answers in chat and ask user to select one
	function displayPossibleAnswers(err, question) {
		logger.debug('Getting possible answers..');
		
		if (err) {
			logger.error('Failed getting stack question data: %s', err);
			Messages.Normal(msg.channel, 'There was a problem fetching the information for that question. Try again maybe?');
			return;
		}
		
		const answerEntryTemplate = '**[%s]** %s points - by %s (%s rep)\n';
		const messageTemplate = 'Here\'s the list of answers I fetched for you:\n\n' +
			'%s\n\n' +
			'Please type the **number** of the answer you want to select.\n' +
			'(The number inside the boxes)';
		
		var answerBlock = '';	// empty string so we don't get undefined crap everywhere
		
		// put question entries into a block one-by-one
		question.answers.forEach((answer, index, array) => {
			answerBlock += util.format(answerEntryTemplate, (index + 1), answer.score, answer.owner.name, answer.owner.reputation);
		});
		
		Messages.Await(msg, util.format(messageTemplate, answerBlock), (err, _msg) => {
			if (err) {
				logger.error('Error sending answers prompt: %s', err);
				Messages.Normal('There was an error sending the selection prompt. Try again?');
				return;
			}
			
			var selection = _msg.content.trim();
			
			if (isNaN(selection)) {
				Messages.Normal(msg.channel, 'You did not enter a valid selection. Aborting.');
				return;
			}
			
			var selectionIndex = selection - 1;
			
			if (!question.answers[selectionIndex]) {
				Messages.Normal(msg.channel, util.format('Invalid selection. The number must be an integer between 1 and %s.', (questions.answers.length + 1)));
				return;
			}
			
			question.answer = answers[selectionIndex];
			
			sendToChat(question, msg);
		});
	}
};
module.exports.moreStackQuestions = moreStackQuestions;

// post question data in chat
function sendToChat(question, msg) {
		const finishedMessage = util.format(
			'**%s**\n' +
			'<%s>\n\n' +
			'```%s```\n' +
			'**%s Points**\n\nAnswered by **%s** (%s) %s ago.%s\n\n' +
			'*Use `%s` for more options.*  **Note: It is not recommended to copy/paste code snippets from this message.**',
			
			question.title,
			question.url,
			
			entities.decode(question.answer.body_markdown).replace('\'\'\'', '\''),	// replace ''' with '
			
			Utility.emojiInteger(question.answer.score),
			question.answer.owner.display_name,
			question.answer.owner.reputation,
			Utility.msToString(question.answer.creation_date),
			(question.answer.last_edit_date ? '' : util.format('\nLast edit made %s ago.', Utility.msToString(question.answer.last_edit_date))),
						
			Config.Chat.StackListCommand);
		
		const backupMessage = util.format(
			'The answer I fetched for you is too big to fit into Discord. Here\'s a link to it instead:\n<%s>',
			question.url);
		
		Messages.Normal(msg.channel, (finishedMessage.length < 2000 ? finishedMessage : backupMessage));
}

// fetch data from stackoverflow based on question id - adds 'answers' object to question object. expects an id property of question
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
