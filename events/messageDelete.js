module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {
        if (message.content == null) return;
        if (message.content.length === 0) return;
        if (message.content.includes('http')) return;

        // ^^
        if (message.content === "admin") return;

        const db = global.DB;
        const logger = global.LOGGER;

        db.serialize(() => {
            db.run(`INSERT INTO deleted
                    VALUES (?, ?, ?, ?, ?)`,
                [message.content, message.createdTimestamp, message.member.id, message.channel.name, message.guildId],
                (err) => {
                    if (err) {
                        logger.error(err.message);
                        console.error(err.message);
                    }
                });
        });
    },
};
