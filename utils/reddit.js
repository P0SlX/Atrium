const { spawn } = require('node:child_process');
const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const download_video_audio = require("./download_video_audio");
const extract_url = require("./extract_url");

module.exports = async (message) => {
    const logger = global.LOGGER;
    const url = await extract_url(message);

    if (url.includes("/user/")) return;

    const ytdlp = spawn('timeout', ['30', 'yt-dlp', '-j', url]);

    ytdlp.stdout.on('data', async (data) => {
        data = JSON.parse(data);
        const urls = data['urls'].split('\n');

        if (urls.length === 0) return;

        // check if url is a png or jpg
        if (urls[0].includes(".png") || urls[0].includes(".jpg")) return;

        await message.channel.sendTyping();

        const subredditRegex = new RegExp(/\/r\/([A-z]*)/i);
        const subreddit = data["webpage_url"].match(subredditRegex)[1];

        const embed = new EmbedBuilder()
            .setColor('#1A8CD8')
            .setTitle(`Lien du post`)
            .setURL(data["webpage_url"])
            .setAuthor({
                name: `r/${subreddit}  (u/${data["uploader"]})`,
                iconURL: "https://i.imgur.com/6IJISys.png",
                url: data["uploader_url"],
            })
            .addFields(
                { name: "Likes", value: data["like_count"].toString(), inline: true },
                { name: "Dislikes", value: data["dislike_count"].toString(), inline: true },
                { name: "Commentaires", value: data["comment_count"].toString(), inline: true },
            )
            .setDescription(data["title"])
            .setTimestamp(new Date(data["timestamp"] * 1000))
            .setFooter({
                text: `Envoyé par ${message.member.user.username}`,
                iconURL: message.member.user.avatarURL({ dynamic: true }),
            });

        // Spoiler check
        const spoilerRegex = new RegExp(/([|]{2})/gi);
        const spoiler = message.content.match(spoilerRegex);

        if (spoiler) {
            embed.setDescription("||" + data["title"] + "||");
        }

        // Si la vidéo n'a pas de son alors il faut la télécharger et merge avec ffmpeg
        if (urls.length > 1) {
            await download_video_audio(message, urls[0], urls[1], embed, spoiler);
        }
        else {
            if (urls[0].includes("gif")) {
                await message.channel.send({ embeds: [embed] });
                await message.channel.send({ content: urls[0] });
            }
            else {
                await download_video(message, data['url'], embed, spoiler);
            }
        }

    });

    ytdlp.stderr.on('data', async (data) => {
        logger.error(`Erreur yt-dlp : ${data}`);
        console.error(`Erreur yt-dlp : ${data}`);
        message.channel.send({ content: `Erreur yt-dlp: ${data}` });
    });
};
