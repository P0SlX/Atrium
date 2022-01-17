const download = require("download");
const fs = require("fs");
const { exec } = require('child_process');

module.exports = async (message) => {
    let attachmentsURL = [];
    message.attachments.forEach(attachment => attachmentsURL.push(attachment.url));

    if (message.content !== "")
        await message.channel.send({content: message.content});

    const folderPath = '/tmp/';
    for (const url of attachmentsURL) {
        const filename = url.split('/')[5]

        download(url, folderPath, {filename: filename + ".webm"})
            .then(async () => {

                // Convertion du fichier en MP4
                exec(`ffmpeg -i ${folderPath}${filename}.webm -crf 28 ${folderPath}${filename}.mp4`, async (error, stdout, stderr) => {
                    if (error)  return message.channel.send({content: "Impossible de convertir la vidéo..."});
                    await message.channel.send({files: [`${folderPath}${filename}.mp4`]});

                    fs.unlink(`${folderPath}${filename}.webm`, (err) => {})
                    fs.unlink(`${folderPath}${filename}.mp4`, (err) => {})
                });

            })
    }
    await message.delete();
}
