const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");


module.exports = async (message, url, embed, spoiler) => {
    const folderPath = '/tmp/';

    let filename = `${uuidv1()}.mp4`;

    if (spoiler)
        filename = `SPOILER_${uuidv1()}.mp4`;

    download(url, folderPath, {filename: filename})
        .then(async () => {
            try {
                await message.channel.send({embeds: [embed]});
                await message.channel.send({files: [`${folderPath}${filename}`]});
                await message.delete();
            } catch (e) {
                await message.channel.send({content: "Vidéo trop lourde pour être envoyée. Achète Nitro connard"});
            }
            fs.unlink(`${folderPath}${filename}`, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        })
}
