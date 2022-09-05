const { exec } = require("child_process");
const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const extract_url = require("./extract_url");

module.exports = async (message) => {
	const url = await extract_url(message);

	const logger = global.LOGGER.child({ "url": url });
	logger.info("Twitter");

	const { error, stdout } = await exec(`timeout 30 yt-dlp -j ${url}`);

	if (error) {
		logger.error(`Erreur yt-dlp : ${error}`);
		console.error(`Erreur yt-dlp : ${error}`);
		await message.channel.send({ content: `Erreur yt-dlp: ${error}` });
		return;
	}
	// Sometimes yt-dlp returns an empty string
	if (stdout.toString().length === 0) return;

	await message.channel.sendTyping();

	const data = JSON.parse(stdout.toString()).catch(async (err) => {
		logger.error(err);
		console.error(err);
		await message.reply({ content: "Impossible de parse le JSON...", allowedMentions: { repliedUser: false } });
	});

	// Le tweet est vide avec juste une image / vidéo
	if (data["description"].split(' ')[0].includes('http')) {
		data["description"] = "";
	}
	else {
		data["description"] = data["description"].replace("  ", "\n\n");

		// Retire les liens et les hashtags
		const regexURL = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
		const regexHashtag = new RegExp(/\B(\#[a-zA-Z]+\b)/gi);
		const urlsToDelete = data["description"].match(regexURL);
		const hashtagsToDelete = data["description"].match(regexHashtag);
		if (urlsToDelete !== null) {
			urlsToDelete.forEach((item) => {
				data["description"] = data["description"].replace(item, "");
			});
		}

		if (hashtagsToDelete !== null) {
			hashtagsToDelete.forEach((item) => {
				data["description"] = data["description"].replace(item, "");
			});
		}
	}

	try {
		const embed = new EmbedBuilder()
			.setColor('#1A8CD8')
			.setTitle(`Lien du tweet`)
			.setURL(data["webpage_url"])
			.setAuthor({
				name: `${data["uploader"]} (@${data["uploader_id"]})`,
				iconURL: "https://abs.twimg.com/responsive-web/client-web/icon-default.ee534d85.png",
				url: data["uploader_url"],
			})
			.setDescription(data["description"])
			.addFields(
				{ name: 'Likes', value: data["like_count"].toString(), inline: true },
				{ name: 'Retweets', value: data["repost_count"].toString(), inline: true },
			)
			.setTimestamp(new Date(data["timestamp"] * 1000))
			.setFooter({
				text: `Envoyé par ${message.member.user.username}`,
				iconURL: message.member.user.avatarURL({ dynamic: true }),
			});
		// Spoiler check
		const spoilerRegex = new RegExp(/([|]{2})/gi);
		const spoiler = message.content.match(spoilerRegex);

		if (spoiler) {
			embed.setDescription("||" + data["description"] + "||");
		}

		await download_video(message, data['url'], embed, spoiler);
	} catch (e) {
		logger.error(e);
		console.log(e);
	}
};
