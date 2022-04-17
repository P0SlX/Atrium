const { v1: uuidv1 } = require("uuid");
const download = require("download");
const fs = require("fs");


module.exports = async (message, url, embed, spoiler) => {
	const logger = global.LOGGER;

	const folderPath = '/tmp/';
	let filename = `${uuidv1()}.mp4`;

	if (spoiler) {
		filename = `SPOILER_${uuidv1()}.mp4`;
	}

	download(url, folderPath, { filename: filename })
		.then(async () => {
			await message.channel.send({ embeds: [embed] });
			try {
				await message.channel.send({ files: [`${folderPath}${filename}`] });
			} catch (e) {
				await message.channel.send({ content: url });
			}
			try {
				await message.delete();
			} catch (e) {
				logger.error(e);
				console.error(e);
			}
			fs.unlink(`${folderPath}${filename}`, (err) => {
				if (err) {
					logger.error(err);
					console.error(err);
				}
			});
		})
}
