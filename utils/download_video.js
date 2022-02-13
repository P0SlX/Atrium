const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");


module.exports = async (message, url, embed) => {
    const folderPath = '/tmp/';
    const filename = `${uuidv1()}.mp4`;

    download(url, folderPath, {filename: filename})
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
}
