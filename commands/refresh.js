const {SlashCommandBuilder} = require('@discordjs/builders');
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('refresh')
        .setDescription('Refresh tout les rôles et les sauvegardes'),
    async execute(interaction) {
        interaction.guild.members.fetch().then((members) => {
            let jsonData = JSON.parse("{}");
            for (const member of members.values()) {
                // Récupère les données qui ont changés
                const id = member.id;
                const pseudo = member.nickname;
                let newRolesID = [];
                Array.from(member.roles.cache).forEach(elem => newRolesID.push(elem[0]));

                // Création de la structure finale
                jsonData[id] = {
                    "roles": newRolesID,
                    "nick": pseudo
                };

            }
            // On écrit les changements
            fs.writeFile('resources/roles2.json', JSON.stringify(jsonData), 'utf8', (err) => {
                if (err) throw err;
                return interaction.reply({content: "Rôles refresh"})
            });
        });
    },
};
