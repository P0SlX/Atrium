module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {
        if (message.content == null) return;
        if (message.content.length === 0 ) return;

        // ^^
        if (message.content === "admin") return;

        const db = global.DB;
        db.serialize(() => {
            db.run(`INSERT INTO deleted VALUES (?, ?, ?, ?, ?)`,
                [message.content, message.createdTimestamp, message.member.id, message.channel.name, message.guildId],
                (err) => {
                    if (err) console.error(err.message);
                });
        });
    },
};
