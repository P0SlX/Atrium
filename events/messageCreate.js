const twitter = require('../utils/twitter')
const tiktok = require('../utils/tiktok')
const admin = require('../utils/admin')
const webm = require('../utils/webm')
const reddit = require('../utils/reddit')


module.exports = {
    name: 'messageCreate',
    once: false,
    async execute(message) {
        if (message.content.includes("twitter.com"))
            await twitter(message);
        else if (message.content.includes("tiktok.com"))
            await tiktok(message);
        else if (message.content.includes("reddit.com"))
            await reddit(message);
        else if (message.attachments.find(attach => attach.name.includes(".webm")))
            await webm(message);
        else if (message.content === "admin")
            await admin(message);
    },
};
