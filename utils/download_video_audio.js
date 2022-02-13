const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");
const {exec} = require("child_process");


module.exports = async (message, video, audio, embed) => {
    const folderPath = '/tmp/';
    const video_filename = `${uuidv1()}.mp4`;
    const audio_filename = `${uuidv1()}.mp4`;
    const output_filename = `${uuidv1()}.mp4`;

    download(video, folderPath, {filename: video_filename})
        .then(async () => {
            download(audio, folderPath, {filename: audio_filename})
                .then(async () => {
                    exec(`ffmpeg -i ${folderPath}${video_filename} -i ${folderPath}${audio_filename} -c copy ${folderPath}${output_filename}`, async (error, stdout, stderr) => {
                        if (error) {
                            console.error(`ffmpeg error: ${error}`);
                            await message.channel.send({content: "Error while merging audio and video"});
                            return;
                        }

                        await message.channel.send({embeds: [embed]});
                        await message.channel.send({files: [`${folderPath}${output_filename}`]});
                        await message.delete();
                        await fs.unlink(`${folderPath}${video_filename}`, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        await fs.unlink(`${folderPath}${audio_filename}`, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        await fs.unlink(`${folderPath}${output_filename}`, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    });
                });
        });
}
