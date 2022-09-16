const { spawn } = require('node:child_process');
const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const extract_url = require("./extract_url");

module.exports = async (message) => {
    const url = await extract_url(message);

    const logger = global.LOGGER.child({ "url": url });
    logger.info("Twitch");

    const ytdlp = spawn('timeout', ['30', 'yt-dlp', '-j', url]);

    ytdlp.stdout.on('data', async (data) => {
        data = JSON.parse(data);
        await message.channel.sendTyping();

        const creator = data["creator"];
        let title = data["title"];
        const uploadDate = new Date(data["timestamp"] * 1000);
        const videoUrl = data["formats"].find((item) => item["format_id"] === "720")["url"];
        const views = data["view_count"];

        // Spoiler check
        const spoilerRegex = new RegExp(/([|]{2})/gi);
        const spoiler = message.content.match(spoilerRegex);

        try {
            const embed = new EmbedBuilder()
                .setColor('#1A8CD8')
                .setTitle(`Lien du clip`)
                .setURL(url)
                .setAuthor({
                    name: creator,
                    iconURL: "https://cdn3.iconfinder.com/data/icons/popular-services-brands-vol-2/512/twitch-256.png",
                })
                .setDescription(title)
                .addFields({ name: 'Vues', value: views.toString() })
                .setTimestamp(uploadDate)
                .setFooter({
                    text: `Envoyé par ${message.member.user.username}`,
                    iconURL: message.member.user.avatarURL({ dynamic: true }),
                });

            if (spoiler)
                embed.setDescription("||" + title + "||");

            await download_video(message, videoUrl, embed, spoiler);
        } catch (e) {
            logger.error(e);
            console.log(e);
        }
    });
};
