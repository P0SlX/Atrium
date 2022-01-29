const {SlashCommandBuilder} = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refresh tout les rôles et les sauvegardes'),
    async execute(interaction) {
        interaction.guild.members.fetch().then((members) => {
            const db = global.DB;

            db.serialize(() => {
                // SQLite n'a pas TRUNCATE TABLE mais DELETE FROM
                db.run(`DELETE FROM roles`, (err) => {
                    if (err)
                        console.error(err);

                    const sql = `INSERT INTO roles(roles, nickname, id) 
                           VALUES(?, ?, ?)`;

                    for (const member of members.values()) {

                        // Création de l'array avec juste l'id des roles
                        let roles = [];
                        Array.from(member.roles.cache).forEach(elem => roles.push(elem[0]));

                        db.run(sql, [roles, member.nickname, member.id.toString()], (err) => {
                            if (err)
                                console.error(err.message);

                            return interaction.reply({content: "Roles refresh avec succès !"})
                        });
                    }
                });
            });
        });
    },
};
