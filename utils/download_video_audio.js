const { v1: uuidv1 } = require("uuid");
const { download } = require("./download");
const fs = require("fs");
const { exec } = require("child_process");


module.exports = async (message, video, audio, embed, spoiler) => {
    const logger = global.LOGGER;

    const folderPath = '/tmp/';
    const video_filename = `${uuidv1()}.mp4`;
    const audio_filename = `${uuidv1()}.mp4`;
    let output_filename = `${uuidv1()}.mp4`;

    if (spoiler) {
        output_filename = `SPOILER_${uuidv1()}.mp4`;
    }

    await Promise.all([
        download(video, video_filename, folderPath),
        download(audio, audio_filename, folderPath),
    ]);

    const { error } = await exec(`timeout 30 ffmpeg -i ${folderPath}${video_filename} -i ${folderPath}${audio_filename} -c copy ${folderPath}${output_filename}`);

    if (error) {
        logger.error(`Erreur ffmpeg : ${error}`);
        console.error(`Erreur ffmpeg : ${error}`);
        await message.channel.send({ content: `Erreur ffmpeg: ${error}` });
        return;
    }

    // Sending embed
    await message.channel.send({ embeds: [embed] });

    // Try sending file
    await message.channel.send({ files: [`${folderPath}${output_filename}`] })
        .catch(async () => await message.channel.send({ content: "Vidéo trop lourde pour être envoyée. Achète Nitro..." }));

    // Try deleting message if not already deleted by someone else
    await message.delete().catch((err) => {
        logger.error(err);
        console.error(err);
    });

    fs.unlink(`${folderPath}${video_filename}`, () => { });
    fs.unlink(`${folderPath}${audio_filename}`, () => { });
    fs.unlink(`${folderPath}${output_filename}`, () => { });
};
