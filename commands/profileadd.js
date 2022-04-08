const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { host, user, password, database } = require('../config.json');
const riot_api = require('../utils/riot_api');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profileadd')
		.setDescription('Ajouter un profile lol à regarder')
		.addStringOption(option => option.setName('pseudo').setDescription('Profile à ajouter').setRequired(true)),
	async execute(interaction) {

		const res = await riot_api(interaction, false);
		if (res === undefined) return;

		// Évite de timout si le serveur met du temps à répondre
		await interaction.reply({ content: "Ajout du profil en cours...", ephemeral: true });

		const con = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});

		let rankflex;
		let ranksoloq = rankflex = {
			"tier": "N/A",
			"rank": "",
			"leaguePoints": 0,
			"wins": 0,
			"losses": 0,
		};


		if (res["rank"].length > 0) {
			for (const rank of res.rank) {
				if (rank["queueType"] === "RANKED_SOLO_5x5") {
					ranksoloq = rank;
				}
				if (rank["queueType"] === "RANKED_FLEX_SR") {
					rankflex = rank;
				}
			}
		}


		const req = `INSERT INTO accounts VALUES ("${res["sum"]['puuid']}", "${res["sum"]['name']}", ${res["sum"]['summonerLevel']}, ${res["sum"]['profileIconId']}, "${ranksoloq['tier']} ${ranksoloq['rank']}", ${ranksoloq['leaguePoints']}, ${ranksoloq['wins']}, ${ranksoloq['losses']}, "${rankflex['tier']} ${rankflex['rank']}", ${rankflex['leaguePoints']}, ${rankflex['wins']}, ${rankflex['losses']});`;

		await con.connect(function(err) {
			if (err) throw err;
			con.query(req, async function(err) {
				if (err) {
					if (err.toString().includes("ER_DUP_ENTRY")) {
						await interaction.editReply({ content: "Le compte est déjà enregistré", ephemeral: true });
					}
					else {
						console.error(err);
						await interaction.editReply({ content: `Erreur : \`${err}\``, ephemeral: true });
					}
				}
				else {
					await interaction.editReply({ content: "Le compte a été ajouté avec succès", ephemeral: true });
				}
			});
		});
	},
};