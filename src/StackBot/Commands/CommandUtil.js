// command utilities that do.. utility stuff

module.exports.getArguments = function getArguments(command) {
	return command.split(new RegExp("\ (.*)"))[1].trim();
};