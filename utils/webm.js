const download = require("download");
const fs = require("fs");
const {exec} = require('child_process');
const {MessageEmbed} = require("discord.js");

module.exports = async (message) => {
    let attachmentsURL = [];
    message.attachments.forEach(attachment => attachmentsURL.push(attachment.url));
    let embedSent = false;

    const folderPath = '/tmp/';
    for (const url of attachmentsURL) {
        const filename = url.split('/')[5]

        await download(url, folderPath, {filename: filename + ".webm"})
            .then(async () => {

                // Convertion du fichier en MP4
                exec(`timeout 300 ffmpeg -i ${folderPath}${filename}.webm -crf 28 ${folderPath}${filename}.mp4`, async (error, stdout, stderr) => {
                    if (error) return message.channel.send({content: "Impossible de convertir la vidéo..."});

                    // Envoi de l'embed qu'une seule fois si il y a plusieurs vidéos
                    if (!embedSent) {
                        const embed = new MessageEmbed()
                            .setColor('#465DD8')
                            .setTitle('WEBM -> MP4')
                            .setTimestamp(new Date())
                            .setFooter({
                                text: `Envoyé par ${message.member.user.username}`,
                                iconURL: message.member.user.avatarURL({dynamic: true})
                            });

                        if (message.content !== "")
                            embed.setTitle(message.content);

                        await message.channel.send({embeds: [embed]});
                        await message.delete();
                        embedSent = true;
                    }

                    await message.channel.send({files: [`${folderPath}${filename}.mp4`]});
                    fs.unlink(`${folderPath}${filename}.webm`, (err) => {
                    })
                    fs.unlink(`${folderPath}${filename}.mp4`, (err) => {
                    })
                });
            })
    }
}
