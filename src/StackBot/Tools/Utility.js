module.exports.msToString = function(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
};

module.exports.emojiInteger = function(number) {
	var digits = (""+number).split("");
	const emojiArray = [':zero:', ':one:', ':two:', ':three:', ':four:', ':five:', ':six:', ':seven:', ':eight:', ':nine:'];

	var emojiString = "";

	digits.forEach((digit, index, array) => {
		try {
			emojiString = util.format('%s%s', emojiString, emojiArray[parseInt(digit)]);
		} catch(er) {
			logger.warning('Failed parsing \'%s\' as emoji. (Not an integer?)', number);
			return number;
		}
	});

	return emojiString;
};

module.exports.messageInfoString = function(message) {
	if (message.channel.server)
		return util.format('[%s/%s : %s/%s] (%s/%s)', message.server.name, message.server.id, message.channel.name, message.channel.id, message.author.name, message.author.id);
	else
		return util.format('[PM: %s/%s (%s)]', message.author.name, message.author.id, message.channel.id);
};
