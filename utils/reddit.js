const {exec} = require("child_process");
const {MessageEmbed} = require("discord.js");
const download_video = require("./download_video");
const download_video_audio = require("./download_video_audio");
const extract_url = require("./extract_url");

module.exports = async (message) => {
    const url = await extract_url(message, "reddit.com");

    // Real shit
    exec(`yt-dlp -j ${url}`, async (error, stdout, stderr) => {
        // De plus yt-dlp écrit les warning dans stderr donc ca prend la tête
        if (error) {
            return;
        }

        await message.channel.sendTyping();

        let j = '';
        try {
            j = JSON.parse(stdout);
        } catch (e) {
            console.error(e);
            await message.reply({
                content: "Impossible de parse le JSON...", allowedMentions: {repliedUser: false}
            });
            return;
        }

        const subredditRegex = new RegExp(/\/r\/([A-z]*)/i);
        const subreddit = j["webpage_url"].match(subredditRegex)[1];

        const embed = new MessageEmbed()
            .setColor('#1A8CD8')
            .setTitle(`Lien du post`)
            .setURL(j["webpage_url"])
            .setAuthor({
                name: `r/${subreddit}  (u/${j["uploader"]})`,
                iconURL: "https://i.imgur.com/6IJISys.png",
                url: j["uploader_url"]
            })
            .addField('Likes', j["like_count"].toString(), true)
            .addField('Dislikes', j["dislike_count"].toString(), true)
            .addField('Commentaires', j["comment_count"].toString(), true)
            .setDescription(j["title"])
            .setTimestamp(new Date(j["timestamp"] * 1000))
            .setFooter({
                text: `Envoyé par ${message.member.user.username}`,
                iconURL: message.member.user.avatarURL({dynamic: true})
            });

        const urls = j['urls'].split('\n');

        // Si la vidéo n'a pas de son alors il faut la télécharger et merge avec ffmpeg
        if (urls.length > 1)
            await download_video_audio(message, urls[0], urls[1], embed);
        else
            await download_video(message, j['url'], embed);
    });
}
