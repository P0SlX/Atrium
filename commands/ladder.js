const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
const { host, user, password, database } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('ladder')
		.setDescription('Afficher le classement du serveur sur lol')
		.addStringOption(option => option.setName('queuetype').setDescription('Type de queue').setRequired(true)
			.addChoice('SoloQ', 'soloq')
			.addChoice('Flex', 'flex'),
		),

	async execute(interaction) {
		const con = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});

		const ranks = ['N/A', 'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'];
		const romain = ['0', 'IV', 'III', 'II', 'I'];
		const res = [];

		if (interaction.options.getString('queuetype') === 'soloq') {
			const req = "SELECT summoner_name, ranksoloq, lpsoloq, winssoloq, lossessoloq FROM accounts;";
			await con.connect(function(err) {
				if (err) throw err;
				con.query(req, async function(err, result) {
					if (err) throw err;

					for (let i = 0; i < Object.keys(result).length; i++) res.push(result[i]);

					for (let i = 0; i < Object.keys(result).length; i++) {
						const soloq = res[i]['ranksoloq'].split(' ');
						res[i]['classementsoloq'] = ranks.indexOf(soloq[0]);
						if (soloq[0] !== 'N/A') res[i]['classementsoloq'] += romain.indexOf(soloq[1]) / 4;
						res[i]['classementsoloq'] += res[i]['lpsoloq'] / 400;
						res[i]['ranksoloq'] = soloq[0].toLowerCase() + ' ' + soloq[1];
					}

					res.sort(function(a, b) {
						return b['classementsoloq'] - a['classementsoloq'];
					});

					while (res[Object.keys(res).length - 1]['classementsoloq'] === 0) {
						res.pop();
					}

					for (let i = 0; i < Object.keys(res).length; i++) {
						let out = "";
						for (let j = 0; j < Object.keys(res[i]['ranksoloq']).length; j++) {
							if (j === 0) {
								out += res[i]['ranksoloq'][j].toUpperCase();
							}
							else {
								out += res[i]['ranksoloq'][j];
							}
						}
						res[i]['ranksoloq'] = out;
					}

					const ladder = new MessageEmbed()
						.setColor("#0099ff")
						.setTitle("Classement en SoloQ du serveur")
						.setFooter({ text: "N'affiche pas les non classés" })
						.setTimestamp(new Date());

					for (let i = 0; i < Object.keys(res).length; i++) {
						ladder.addField(res[i]['summoner_name'], '*' + res[i]['ranksoloq'] + ' ' + res[i]['lpsoloq'] + ' LP*', false);
					}

					await interaction.reply({ embeds: [ladder] });
				});
			});

		}
		else {
			const req = "SELECT summoner_name, rankflex, lpflex, winsflex, lossesflex FROM accounts;";

			await con.connect(function(err) {
				if (err) throw err;
				con.query(req, async function(err, result) {
					if (err) throw err;

					for (let i = 0; i < Object.keys(result).length; i++) res.push(result[i]);
					for (let i = 0; i < Object.keys(result).length; i++) {
						const flex = res[i]['rankflex'].split(' ');
						res[i]['classementflex'] = ranks.indexOf(flex[0]);
						if (flex[0] != 'N/A') res[i]['classementflex'] += romain.indexOf(flex[1]) / 4;
						res[i]['classementflex'] += res[i]['lpflex'] / 400;
						res[i]['rankflex'] = flex[0].toLowerCase() + ' ' + flex[1];
					}
					res.sort(function(a, b) {
						return b['classementflex'] - a['classementflex'];
					});

					while (res[Object.keys(res).length - 1]['classementflex'] === 0) {
						res.pop();
					}

					for (let i = 0; i < Object.keys(res).length; i++) {
						let out = "";
						for (let j = 0; j < Object.keys(res[i]['rankflex']).length; j++) {
							if (j === 0) {
								out += res[i]['rankflex'][j].toUpperCase();
							}
							else {
								out += res[i]['rankflex'][j];
							}
						}
						res[i]['rankflex'] = out;
					}

					const ladder = new MessageEmbed()
						.setColor("#0099ff")
						.setTitle("Classement en Flex du serveur")
						.setFooter({ text: "N'affiche pas les non classés" })
						.setTimestamp(new Date());

					for (let i = 0; i < Object.keys(res).length; i++) {
						ladder.addField(res[i]['summoner_name'], '*' + res[i]['rankflex'] + ' ' + res[i]['lpflex'] + ' LP*', true);
					}

					await interaction.reply({ embeds: [ladder] });
				});
			});
		}
	},
};