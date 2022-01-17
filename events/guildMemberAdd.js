const fs = require('fs');

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute(member) {
        let jsonData = null;
        fs.readFile('resources/roles.json', (err, data) => {
            if (err) throw err;
            // Importe le JSON en mémoire
            jsonData = JSON.parse(data.toString());

            // Si c'est un nouveau membre
            const id = member.id;
            if (jsonData[id] === undefined) return

            // Sinon on va récup les données
            const memberData = jsonData[id];
            const pseudo = memberData["nick"];
            const roles = memberData["roles"];

            // Et lui appliquer
            member.edit({nick: pseudo, roles: roles});
        });
    },
};
