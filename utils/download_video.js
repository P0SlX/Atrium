const { v1: uuidv1 } = require("uuid");
const { download } = require('../utils/download');
const fs = require("fs");


module.exports = async (message, url, embed, spoiler) => {
    const logger = global.LOGGER;

    const folderPath = '/tmp/';
    let filename = `${uuidv1()}.mp4`;

    if (spoiler) {
        filename = `SPOILER_${uuidv1()}.mp4`;
    }

    // Download video in tmp folder
    await download(url, filename, folderPath);

    // Sending embed first because discord still don't support video in embed...
    await message.channel.send({ embeds: [embed] });

    // Try sending video, if it fails (file too large), send the url
    await message.channel.send({ files: [`${folderPath}${filename}`] })
        .catch(async () => await message.channel.send({ content: url }));

    // Try deleting message if not already deleted by someone else
    await message.delete().catch((err) => {
        logger.error(err);
        console.error(err);
    });

    // Delete video from tmp folder
    fs.unlinkSync(`${folderPath}${filename}`);
};
