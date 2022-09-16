const webm = require('../utils/webm');
const tempo = require('../utils/tempo');
const admin = require('../utils/admin');
const twitch = require('../utils/twitch');
const tiktok = require('../utils/tiktok');
const reddit = require('../utils/reddit');
const twitter = require('../utils/twitter');
const { who_asked } = require('../resources/who_asked.json');

module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        // Si c'est un message du bot et que c'est pas dans le chan #tempo
        if (message.author.bot && message.channel.id !== "841405624985190430") return;

        const random = Math.floor(Math.random() * 500) + 1;
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
        else if (message.content.includes("clips.twitch.tv")) {
            await twitch(message);
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
        else if (random === 1 && !(message.author.id === "200227803189215232" && message.channel.id === "853019023544549376")) {
            message.reply({ content: who_asked[Math.floor(Math.random() * who_asked.length)] });
        }
    },
};
