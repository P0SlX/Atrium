const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const { get } = require("./https");
const extract_url = require("./extract_url");

module.exports = async (message) => {
    const url = await extract_url(message);
    if (!url) return;

    const logger = global.LOGGER;

    await message.channel.sendTyping();

    // Fetch webpage
    const data = await get(url).catch((err) => {
        logger.error(err);
        console.error(err);
        message.reply({ content: "Erreur lors de la récupération des données" });
        return false;
    });

    // Extract JSON from webpage
    const regex = new RegExp(/<script id="SIGI_STATE" type="application\/json">(.*)<\/script><script id="SIGI_RETRY" type="application\/json">/i);
    const match = data.match(regex)[1];
    const json = JSON.parse(match);

    // Video infos
    const videoId = json["ItemList"]["video"]["list"][0];
    const videoUrl = encodeURI(json["ItemModule"][videoId]["video"]["downloadAddr"]);
    const filesize = json["ItemModule"][videoId]["video"]["bitrateInfo"][0]["DataSize"]; // in bytes
    const createdAt = new Date(json["ItemModule"][videoId]["createTime"] * 1000);

    // Post infos
    const likes = json["ItemModule"][videoId]["stats"]["diggCount"];
    const comments = json["ItemModule"][videoId]["stats"]["commentCount"];
    const views = json["ItemModule"][videoId]["stats"]["playCount"];
    let description = json["ItemModule"][videoId]["desc"];

    // User infos
    const authorUniqueId = json["ItemModule"][videoId]["author"];
    const nickname = json["ItemModule"][videoId]["nickname"];
    const avatar = encodeURI(json["UserModule"]["users"][authorUniqueId]["avatarThumb"]);


    // Spoiler check
    const spoiler = message.content.match(new RegExp(/([|]{2})/gi));
    if (spoiler) description = "||" + description + "||";

    // Remove all hashtags from description
    const hashtagsRegex = new RegExp(/(#\w+)/gi);
    const hashtagsToDelete = description.match(hashtagsRegex);

    if (hashtagsToDelete !== null) {
        hashtagsToDelete.forEach((item) => {
            description = description.replace(item, "");
        });
    }

    try {
        const embed = new EmbedBuilder()
            .setColor('#EF2950')
            .setTitle(`Lien du TikTok`)
            .setURL(url)
            .setAuthor({
                name: `${nickname} (@${authorUniqueId})`,
                iconURL: avatar,
                url: `https://www.tiktok.com/@${authorUniqueId}`,
            })
            .addFields(
                { name: "Vues", value: views.toString(), inline: true },
                { name: "Likes", value: likes.toString(), inline: true },
                { name: "Commentaires", value: comments.toString(), inline: true },
            )
            .setTimestamp(createdAt)
            .setFooter({
                text: `Envoyé par ${message.member.user.username}`,
                iconURL: message.member.user.avatarURL({ dynamic: true }),
            });

        if (description.length > 0) {
            embed.setDescription(description);
        }

        await download_video(message, videoUrl, embed, spoiler);
    } catch (e) {
        logger.error(e);
        console.log(e);
    }
};
