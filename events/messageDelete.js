module.exports = {
    name: 'messageDelete',
    once: false,
    async execute(message) {

        // Serveur de dev
        if (message.guild.id.toString() === "688788377092358212") return;

        const db = global.DB;
        db.serialize(() => {
            db.run(`INSERT INTO deleted VALUES (?, ?, ?)`,
                [message.content, message.createdTimestamp, message.member.id],
                (err) => {
                    if (err) console.error(err.message);
                });
        });
    },
};
