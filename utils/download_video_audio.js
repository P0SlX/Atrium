const { v1: uuidv1 } = require("uuid");
const download = require("download");
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

	download(video, folderPath, { filename: video_filename })
		.then(async () => {
			download(audio, folderPath, { filename: audio_filename })
				.then(async () => {
					exec(`timeout 30 ffmpeg -i ${folderPath}${video_filename} -i ${folderPath}${audio_filename} -c copy ${folderPath}${output_filename}`, async (error, stdout, stderr) => {
						if (error) {
							logger.error(`Erreur ffmpeg : ${error}`);
							console.error(`Erreur ffmpeg : ${error}`);
							await message.channel.send({ content: "Erreur ffmpeg" });
							return;
						}

						try {
							await message.channel.send({ embeds: [embed] });
							await message.channel.send({ files: [`${folderPath}${output_filename}`] });
							await message.delete();
						} catch (e) {
							await message.channel.send({ content: "Vidéo trop lourde pour être envoyée. Achète Nitro..." });
						}

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
