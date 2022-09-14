const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const extract_url = require("./extract_url");
const axios = require('axios');

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
        try {
            data = await axios.get(url, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                },
            }).then((res) => res.data["aweme_detail"]);
            cpt = 10;
        } catch (e) {
            logger.error(e);
            cpt++;
        }
    }

    if (cpt !== 10) {
        await message.reply({ content: "<@200227803189215232> Il est l'heure de changer de serveur !" });
    }

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
            .setTimestamp(new Date(data["create_time"] * 1000))
            .setFooter({
                text: `Envoyé par ${message.member.user.username}`,
                iconURL: message.member.user.avatarURL({ dynamic: true }),
            });

        let description = data["desc"];
        // Spoiler check
        const spoilerRegex = new RegExp(/([|]{2})/gi);
        const spoiler = message.content.match(spoilerRegex);

        if (spoiler) {
            description = "||" + description + "||";
        }

        // Remove all hashtags from description
        const hashtagsRegex = new RegExp(/(#\w+)/gi);
        const hashtagsToDelete = data["desc"].match(hashtagsRegex);

        if (hashtagsToDelete !== null) {
            hashtagsToDelete.forEach((item) => {
                description = description.replace(item, "");
            });
        }

        if (description.length > 0) {
            embed.setDescription(description);
        }

        await download_video(message, data['video']['play_addr']['url_list'][0], embed, spoiler);
    } catch (e) {
        logger.error(e);
        console.log(e);
    }
};
