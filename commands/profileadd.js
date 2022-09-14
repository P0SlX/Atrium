const { SlashCommandBuilder } = require('@discordjs/builders');
const riot_api = require('../utils/riot_api');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profileadd')
        .setDescription('Ajouter un profile lol à regarder')
        .addStringOption(option => option.setName('pseudo').setDescription('Profile à ajouter').setRequired(true))
        .addStringOption(option => option.setName('smurf').setDescription('Compte principal ou secondaire').setRequired(true)
            .addChoices(
                { name: 'Main', value: 'main' },
                { name: 'Smurf', value: 'smurf' },
            ),
        )
        .addStringOption(option => option.setName('from').setDescription('Provenance du compte').setRequired(true)
            .addChoices(
                { name: 'Classe', value: 'classe' },
                { name: 'Serveur', value: 'serv' },
            ),
        ),
    async execute(interaction) {
        const res = await riot_api(interaction, false);
        if (!res) return;

        const logger = global.LOGGER;
        const con = global.con;
        const smurf = interaction.options.getString('smurf');
        const from = interaction.options.getString('from');

        // Évite de timout si le serveur met du temps à répondre
        await interaction.reply({ content: "Ajout du profil en cours...", ephemeral: true });

        let rankflex;
        let ranksoloq = rankflex = {
            "tier": "N/A",
            "rank": "",
            "leaguePoints": 0,
            "wins": 0,
            "losses": 0,
        };

        if (res.rank.length > 0) {
            res.rank.forEach((rank) => {
                if (rank["queueType"] === "RANKED_SOLO_5x5") ranksoloq = rank;
                if (rank["queueType"] === "RANKED_FLEX_SR") rankflex = rank;
            });
        }

        const req = `INSERT INTO accounts
                     VALUES ("${res["sum"]['puuid']}", "${res["sum"]['name']}", ${res["sum"]['summonerLevel']},
                             ${res["sum"]['profileIconId']}, "${ranksoloq['tier']} ${ranksoloq['rank']}",
                             ${ranksoloq['leaguePoints']}, ${ranksoloq['wins']}, ${ranksoloq['losses']},
                             "${rankflex['tier']} ${rankflex['rank']}", ${rankflex['leaguePoints']},
                             ${rankflex['wins']}, ${rankflex['losses']}, "${smurf}", "${from}");`;

        con.query(req, async function(err) {
            if (err) {
                if (err.toString().includes("ER_DUP_ENTRY")) {
                    logger.info(`${interaction.user.username} a utilisé /profileadd | Profile ${res["sum"]['name']} déjà présent`);
                    await interaction.editReply({ content: "Le compte est déjà enregistré", ephemeral: true });
                }
                else {
                    logger.error(`${interaction.user.username} a utilisé /profileadd | Erreur lors de l'ajout du profile ${res["sum"]['name']}`);
                    console.error(err);
                    await interaction.editReply({ content: `Erreur : \`${err}\``, ephemeral: true });
                }
            }
            else {
                logger.info(`${interaction.user.username} a utilisé /profileadd | Profile ${res["sum"]['name']} ajouté avec succès`);
                await interaction.editReply({ content: "Le compte a été ajouté avec succès", ephemeral: true });
            }
        });
    },
};