const twitter = require('../utils/twitter');
const tiktok = require('../utils/tiktok');
const admin = require('../utils/admin');
const webm = require('../utils/webm');
const reddit = require('../utils/reddit');
const tempo = require('../utils/tempo');


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		if (message.author.bot) return;

		const random = Math.floor(Math.random() * 1000) + 1;

		// TODO: Sanitize message content

		if (message.content.includes("twitter.com")) {
			await twitter(message);
		}
        else if (message.content.includes("tiktok.com")) {
			await tiktok(message);
		}
        else if (message.content.includes("reddit.com")) {
			await reddit(message);
		}
        else if (message.channel.id.toString() === "841405624985190430") {
			await tempo(message);
		}
        else if (message.attachments.find(attach => attach.name.includes(".webm"))) {
			await webm(message);
		}
        else if (message.content === "admin") {
			await admin(message);
		}
        else if (random === 50 && message.author.id !== "200227803189215232" && message.channel.id !== "878333881063993364") {
			message.reply({ content: "https://tenor.com/view/who-asked-nobody-asked-nobody-cares-damn-thats-crazy-gif-20130694" })
		}
	},
};
