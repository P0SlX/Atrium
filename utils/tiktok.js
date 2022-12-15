const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const { get } = require("./https");
const extract_url = require("./extract_url");
const { spawn } = require("node:child_process");

module.exports = async (message) => {
    const url = await extract_url(message);
    if (!url) return;

    const logger = global.LOGGER.child({ "url": url });
    logger.info("Twitch");

    const ytdlp = spawn('timeout', ['30', 'yt-dlp', '-j', url]);

    ytdlp.stdout.on('data', async (data) => {
        data = JSON.parse(data);
        await message.channel.sendTyping();

        const nickname = data["creator"];
        const at = data["uploader"];
        const urlAuthor = `https://www.tiktok.com/@${data["id"]}`;

        let title = data["description"];
        const views = data["view_count"];
        const likes = data["like_count"];
        const comments = data["comment_count"];
        const createdAt = new Date(data["upload_date"] * 1000);

        // get video url from data["format"], filter all video that are not vcodec='h264'
        // and take the heaviest one under 8MB
        let videoUrlsArr = data["formats"].filter((item) => item["vcodec"] === "h264" && item["filesize"] < 8000000 && !item["format_note"].includes('watermark'));
        if (videoUrlsArr.length === 0) {
            videoUrlsArr = data["formats"].filter((item) => item["vcodec"] === "h264" && !item["format_note"].includes('watermark'));
        }
        const videoUrl = videoUrlsArr[videoUrlsArr.length - 1]["url"];

        // Remove all hashtags from description
        const hashtagsRegex = new RegExp(/(#\S*)/gi);
        const hashtagsToDelete = title.match(hashtagsRegex);

        if (hashtagsToDelete !== null) {
            hashtagsToDelete.forEach((item) => {
                title = title.replace(item, "");
            });
        }

        // Spoiler check
        const spoilerRegex = new RegExp(/([|]{2})/gi);
        const spoiler = message.content.match(spoilerRegex);

        try {
            const embed = new EmbedBuilder()
                .setColor('#EF2950')
                .setTitle(`Lien du TikTok`)
                .setURL(url)
                .setAuthor({
                    name: `${nickname} (@${at})`,
                    iconURL: "https://assets.stickpng.com/images/602179070ad3230004b93c28.png",
                    url: urlAuthor,
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

            if (title.length > 0) {
                embed.setDescription(title);
            }

            if (spoiler) {
                embed.setDescription("||" + title + "||");
            }

            await download_video(message, videoUrl, embed, spoiler);
        } catch (e) {
            logger.error(e);
            console.log(e);
        }
    });
};
