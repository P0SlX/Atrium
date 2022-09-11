const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refresh tout les rôles et les sauvegardes'),
    async execute(interaction) {

        const client = global.CLIENT;
        const db = global.DB;
        const logger = global.LOGGER;

        // Delete all roles
        db.serialize(() => {
            // SQLite n'a pas TRUNCATE TABLE mais DELETE FROM
            db.run(`DELETE
                    FROM roles`, (err) => {
                if (err) {
                    logger.error(err.message);
                    console.error(err.message);
                    return interaction.reply('Une erreur est survenue');
                }
            });
        });

        const sql = `INSERT INTO roles(roles, nickname, id)
                     VALUES (?, ?, ?)`;

        // Refresh all guilds
        await client.guilds.fetch();

        for (const guild of client.guilds.cache.values()) {
            // Refresh all members
            await guild.members.fetch();
            for (const member of guild.members.cache.values()) {
                // Création de l'array avec juste l'id des roles
                let roles = [];
                Array.from(member.roles.cache).forEach(elem => roles.push(elem[0]));

                await db.run(sql, [roles, member.nickname, member.user.id.toString() + guild.id.toString()], (err) => {
                    if (err) {
                        logger.error(err.message);
                        console.error(err.message);
                    }
                });
            }
        }

        logger.info(`${interaction.user.username} a réinitialisé la base de données des rôles`);
        return interaction.reply({ content: "Roles refresh avec succès !" });
    },
};
