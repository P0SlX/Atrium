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
        if (item.includes("twitter.com")) url = item;
    })

    if (url === "") {
        await message.channel.reply({
            content: "Impossible de récup l'URL twitter...", allowedMentions: {repliedUser: false}
        });
        console.log('Erreur: URL Twitter impossible à recup.');
        return;
    }

    // Real shit
    exec(`youtube-dl -j ${url}`, async (error, stdout, stderr) => {
        if (error) {
            // Si ya pas de vidéo osef
            if (error.toString().includes("ERROR"))
                return;

            // Vrai erreur
            else {
                await message.channel.send({
                    content: `<@200227803189215232> J'ai pas réussi à recup la vidéo... (exec->error)`
                });
                console.log(`error: ${error.message}`);
            }
            return;
        }
        if (stderr) {
            await message.channel.send({
                content: `<@200227803189215232> J'ai pas réussi à recup la vidéo... (exec->stderr)`
            });
            console.log(`error: ${error.message}`);
            return;
        }

        await message.channel.sendTyping();

        const j = JSON.parse(stdout);

        // Le tweet est vide avec juste une image / vidéo
        if (j["description"].split(' ')[0].includes('http')) {
            j["description"] = ""
        } else {
            j["description"] = j["description"].replace("  ", "\n\n");

            // Retire les liens à la con et les hashtag
            const regexURL = new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi);
            const regexHashtag = new RegExp(/\B(\#[a-zA-Z]+\b)/gi);
            const urlsToDelete = j["description"].match(regexURL);
            const hastagsToDelete = j["description"].match(regexHashtag);
            if (urlsToDelete !== null)
                urlsToDelete.forEach((item) => {
                    j["description"] = j["description"].replace(item, "");
                })

            if (hastagsToDelete !== null)
                hastagsToDelete.forEach((item) => {
                    j["description"] = j["description"].replace(item, "");
                })
        }

        const embed = new MessageEmbed()
            .setColor('#1A8CD8')
            .setTitle(`Lien du tweet`)
            .setURL(j["webpage_url"])
            .setAuthor({
                name: `${j["uploader"]} (@${j["uploader_id"]})`,
                iconURL: "https://abs.twimg.com/responsive-web/client-web/icon-default.ee534d85.png",
                url: j["uploader_url"]
            })
            .addField('Likes', j["like_count"].toString(), true)
            .addField('Retweets', j["repost_count"].toString(), true)
            .setDescription(j["description"])
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
