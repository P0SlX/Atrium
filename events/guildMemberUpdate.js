module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
        // On stock uniquement les pseudo et les roles
        // Mais l'event est trigger pour d'autre raison
        // Donc si c'est pas ce qu'on veut, on fait pas
        if ((oldMember.nickname === newMember.nickname)
            &&
            (oldMember.roles.cache.size === newMember.roles.cache.size)) {
            return;
        }

        const db = global.DB;
        const logger = global.LOGGER;

        const getUser = `SELECT id
                         FROM ROLES
                         WHERE id = ?`;

        db.serialize(() => {
            db.get(getUser, [oldMember.id.toString() + oldMember.guild.id.toString()], (err, row) => {
                if (err) {
                    logger.error(err.message);
                    console.error(err.message);
                    return;
                }

                let sql;

                // User inexistant ?
                if (!row) {
                    sql = `INSERT INTO roles(roles, nickname, id)
                           VALUES (?, ?, ?)`;
                }
                else {
                    sql = `UPDATE roles
                           SET roles    = ?,
                               nickname = ?
                           WHERE id = ?`;
                }

                // Création de l'array avec juste l'id des roles
                let newRoles = [];
                Array.from(newMember.roles.cache).forEach(elem => newRoles.push(elem[0]));

                db.run(sql, [newRoles, newMember.nickname, newMember.id.toString() + newMember.guild.id.toString()],
                    (err) => {
                        if (err) {
                            logger.error(err.message);
                            console.error(err.message);
                            return;
                        }
                        logger.info(`[${newMember.user.username}] a été mis à jour`);
                    });
            });
        });
    },
};
