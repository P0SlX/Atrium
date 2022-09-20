module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        const db = global.DB;
        const logger = global.LOGGER;

        const sql = `SELECT roles, nickname
                     FROM ROLES
                     WHERE id = ?`;

        db.serialize(() => {
            db.get(sql, [member.id.toString() + member.guild.id.toString()], (err, row) => {
                if (err) {
                    console.error(err.message);
                    logger.error(err.message);
                    return;
                }

                // Nouvel utilisateur
                if (!row) return;

                const roles = row.roles.split(',');
                const pseudo = row.nickname;

                member.edit({ nick: pseudo, roles: roles });
                logger.info(`${member.user.username} a rejoins le serveur, ses rôles ont été récupérés.`);
            });
        });
    },
};
