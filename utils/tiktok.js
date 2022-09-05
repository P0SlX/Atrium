const { EmbedBuilder } = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const download_video = require("./download_video");
const extract_url = require("./extract_url");

async function retrieveURL(message) {
	const url = await extract_url(message);

	// Recupère l'id de la vidéo en suitant les redirections
	const tmp = await fetch(url);
	const regexID = new RegExp(/\/([0-9]+)/i);
	let match = null;

	try {
		// Construction de l'url de l'API
		match = tmp.url.match(regexID)[1];
		return `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${match}`;
	} catch (e) {
		// C'est certainement un profil ou un lien sans vidéo car il ne trouve pas d'id
		return null;
	}
}

module.exports = async (message) => {
	const url = await retrieveURL(message);
	if (!url) return;

	const logger = global.LOGGER;

	await message.channel.sendTyping();

	// Fetch json
	let cpt = 1;
	let data = "";
	while (cpt < 5) {
		await fetch(url)
			.then(async res => {
				// Obligé de try catch car des fois l'api renvoie un mauvais JSON
				try {
					data = await res.json();
					cpt = 10;
				} catch (e) {
				}
			});
	}

	if (cpt !== 10) {
		await message.reply({ content: "<@200227803189215232> Il est l'heure de changer de serveur !" });
	}

	data = data["aweme_detail"];

	try {
		const embed = new EmbedBuilder()
			.setColor('#EF2950')
			.setTitle(`Lien du TikTok`)
			.setURL(data["share_info"]["share_url"])
			.setAuthor({
				name: `${data["author"]["nickname"]} (@${data["author"]["unique_id"]})`,
				iconURL: data["author"]["avatar_168x168"]["url_list"][0],
				url: `https://www.tiktok.com/@${data["author"]["unique_id"]}`,
			})
			.addFields(
				{ name: "Vues", value: data["statistics"]["play_count"].toString(), inline: true },
				{ name: "Likes", value: data["statistics"]["digg_count"].toString(), inline: true },
				{ name: "Commentaires", value: data["statistics"]["comment_count"].toString(), inline: true },
			)
			.setDescription(data["desc"])
			.setTimestamp(new Date(data["create_time"] * 1000))
			.setFooter({
				text: `Envoyé par ${message.member.user.username}`,
				iconURL: message.member.user.avatarURL({ dynamic: true }),
			});


		// Spoiler check
		const spoilerRegex = new RegExp(/([|]{2})/gi);
		const spoiler = message.content.match(spoilerRegex);

		if (spoiler) {
			embed.setDescription("||" + data["desc"] + "||");
		}

		// Remove all hashtags from description
		const hashtagsRegex = new RegExp(/\W?(#[a-zA-Z]+\b)/gi)
		const hashtagsToDelete = data["desc"].match(hashtagsRegex);

		if (hashtagsToDelete !== null) {
			hashtagsToDelete.forEach((item) => {
				embed.setDescription(embed.description.replace(item, ""));
			});
		}

		await download_video(message, data['video']['play_addr']['url_list'][0], embed, spoiler);
	} catch (e) {
		logger.error(e);
		console.log(e);
	}
};
