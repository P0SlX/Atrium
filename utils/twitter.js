const { exec } = require("child_process");
const { MessageEmbed } = require("discord.js");
const download_video = require("./download_video");
const extract_url = require("./extract_url");


module.exports = async (message) => {
	const url = await extract_url(message);

	const logger = global.LOGGER.child({ "url": url });
	logger.info("Twitter");


	// Real shit
	exec(`timeout 30 yt-dlp -j ${url}`, async (error, stdout, stderr) => {
		// Si ya une erreur, ca va juster rien faire, et on verra si qlq ping sur le serveur
		// De plus yt-dlp écrit les warning dans stderr donc ca prend la tête
		if (error) return;
		if (stdout.length === 0) return;

		await message.channel.sendTyping();

		let j = '';
		try {
			j = JSON.parse(stdout);
		} catch (e) {
			console.error(e);
			console.error(url);
			await message.reply({
				content: "Impossible de parse le JSON... Contenue du JSON :", allowedMentions: { repliedUser: false },
			});
			await message.reply({
				content: j, allowedMentions: { repliedUser: false },
			});
			return;
		}

		// Le tweet est vide avec juste une image / vidéo
		if (j["description"].split(' ')[0].includes('http')) {
			j["description"] = "";
		}
		else {
			j["description"] = j["description"].replace("  ", "\n\n");

			// Retire les liens et les hashtag
			const regexURL = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
			const regexHashtag = new RegExp(/\B(\#[a-zA-Z]+\b)/gi);
			const urlsToDelete = j["description"].match(regexURL);
			const hashtagsToDelete = j["description"].match(regexHashtag);
			if (urlsToDelete !== null) {
				urlsToDelete.forEach((item) => {
					j["description"] = j["description"].replace(item, "");
				});
			}

			if (hashtagsToDelete !== null) {
				hashtagsToDelete.forEach((item) => {
					j["description"] = j["description"].replace(item, "");
				});
			}
		}

		try {
			const embed = new MessageEmbed()
				.setColor('#1A8CD8')
				.setTitle(`Lien du tweet`)
				.setURL(j["webpage_url"])
				.setAuthor({
					name: `${j["uploader"]} (@${j["uploader_id"]})`,
					iconURL: "https://abs.twimg.com/responsive-web/client-web/icon-default.ee534d85.png",
					url: j["uploader_url"],
				})
				.setDescription(j["description"])
				.addField('Likes', j["like_count"].toString(), true)
				.addField('Retweets', j["repost_count"].toString(), true)
				.setTimestamp(new Date(j["timestamp"] * 1000))
				.setFooter({
					text: `Envoyé par ${message.member.user.username}`,
					iconURL: message.member.user.avatarURL({ dynamic: true }),
				});
			// Spoiler check
			const spoilerRegex = new RegExp(/([|]{2})/gi);
			const spoiler = message.content.match(spoilerRegex);

			if (spoiler) {
				embed.setDescription("||" + j["description"] + "||");
			}

			await download_video(message, j['url'], embed, spoiler);
		} catch (e) {
			logger.error(e);
			console.log(e);
		}
	});
};
