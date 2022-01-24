const {exec} = require("child_process");
const {MessageEmbed} = require("discord.js");
const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");

module.exports = async (message) => {
    const args = message.content.split(" ");

    // Recup le lien
    let url = ""
    args.forEach((item) => {
        if (item.includes("reddit.com")) url = item;
    })

    if (url === "") {
        await message.channel.reply({
            content: "Impossible de récup l'URL de la vidéo...", allowedMentions: {repliedUser: false}
        });
        console.log('Erreur: URL Reddit impossible à recup.');
        return;
    }

    // Real shit
    exec(`youtube-dl -j ${url}`, async (error, stdout, stderr) => {
        // yt-dl clc là dessus, des fois il trigger error et des fois stderr donc on est obligé de faire ca...
        if (error) {
            // Si ya pas de vidéo osef
            if (error.toString().includes("ERROR")) return;

            // Vrai erreur
            await message.channel.send({
                content: `<@200227803189215232> J'ai pas réussi à recup la vidéo... (exec->error)\n \`\`\`${error.message}\`\`\``
            });
            console.log(`error: ${error.message}`);
            return;
        } else if (stderr) {
            // Si ya pas de vidéo osef
            if (stderr.includes("ERROR")) return;

            // Vrai erreur
            await message.channel.send({
                content: `<@200227803189215232> J'ai pas réussi à recup la vidéo... (exec->stderr)\n \`\`\`${stderr}\`\`\``
            });
            console.log(`stderr: ${stderr}`);
            return;
        }

        await message.channel.sendTyping();
        const j = JSON.parse(stdout);

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

        const folderPath = '/tmp/';
        const filename = `${uuidv1()}.mp4`;

        download(j['url'], folderPath, {filename: filename})
            .then(async () => {
                await message.channel.send({embeds: [embed]});
                await message.channel.send({files: [`${folderPath}${filename}`]});
                await message.delete();
                fs.unlink(`${folderPath}${filename}`, (err) => {
                    if (err) {
                        console.error(err)
                    }
                })
            })
    });
}
