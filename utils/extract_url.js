module.exports = async (message) => {
	const regexURL = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
	const url = message.content.match(regexURL)[0];

	if (url === "") {
		await message.channel.reply({
			content: "Impossible de récup l'URL de la vidéo...", allowedMentions: { repliedUser: false },
		});
		console.error('Erreur: URL impossible à recup. Message.content : ' + message.content);
		global.LOGGER.error('Erreur: URL impossible à recup. Message.content : ' + message.content);
		return;
	}
	return url;
};
