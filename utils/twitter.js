const { spawn } = require('node:child_process');
const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const extract_url = require("./extract_url");

module.exports = async (message) => {
    const url = await extract_url(message);

    const logger = global.LOGGER.child({ "url": url });
    logger.info("Twitter");

    const ytdlp = spawn('timeout', ['30', 'yt-dlp', '-j', url]);

    ytdlp.stdout.on('data', async (data) => {
        data = JSON.parse(data);
        await message.channel.sendTyping();

        // Le tweet est vide avec juste une image / vidéo
        if (data["description"].split(' ')[0].includes('http')) {
            data["description"] = "";
        }
        else {
            data["description"] = data["description"].replace("  ", "\n\n");

            // Retire les liens et les hashtags
            const regexURL = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi);
            const regexHashtag = new RegExp(/\B(#[a-zA-Z]+\b)/gi);
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

            if (data["description"] !== "") {
                spoiler ? embed.setDescription("||" + data["description"] + "||") : embed.setDescription(data["description"]);
            }

            await download_video(message, data['url'], embed, spoiler);
        } catch (e) {
            logger.error(e);
            console.log(e);
        }
    });
};
