const fs = require('fs');

module.exports = {
    name: 'guildMemberUpdate',
    once: false,
    async execute(oldMember, newMember) {
        // On stock uniquement les pseudo et les roles
        // Mais l'event est trigger pour d'autre raison
        // Donc si c'est pas ce qu'on veut, on fait pas
        if ((oldMember.nickname === newMember.nickname) && (oldMember.roles.cache.size === newMember.roles.cache.size)) return;

        let jsonData = null;
        fs.readFile('resources/roles.json', (err, data) => {
            if (err) throw err;
            // Importe le JSON en mémoire
            jsonData = JSON.parse(data.toString());

            // Récupère les données qui ont changés
            const id = newMember.id;
            const pseudo = newMember.nickname;
            let newRolesID = [];
            Array.from(newMember.roles.cache).forEach(elem => newRolesID.push(elem[0]));

            // Création de la structure finale
            jsonData[id] = {
                "roles": newRolesID,
                "nick": pseudo
            };

            // On écrit les changements
            fs.writeFile('resources/roles.json', JSON.stringify(jsonData), 'utf8', (err) => {
                if (err) throw err;
            });
        });
    },
};
