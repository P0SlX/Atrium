const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
// eslint-disable-next-line no-shadow
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { host, user, password, database } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profileadd')
		.setDescription('Ajouter un profile lol à regarder')
		.addStringOption(option => option.setName('pseudo').setDescription('Profile à ajouter').setRequired(true)),

	async execute(interaction) {

		let param;
		if (/\s/.test(interaction.options.getString('pseudo'))) {
			param = encodeURIComponent(interaction.options.getString('pseudo').trim());
		}
		else {
			param = interaction.options.getString('pseudo');
		}

		let sum = undefined;
		await fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + param + '?api_key=RGAPI-51d60eda-093b-4e89-8b9b-f04f7ae8b1f4')
			.then(async response => sum = await response.json());
		if (sum.status >= 400) {
			throw new Error("Bad response from server");
		}

		let rank = await fetch('https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + sum["id"] + '?api_key=RGAPI-51d60eda-093b-4e89-8b9b-f04f7ae8b1f4');
		if (rank.status >= 400) {
			throw new Error("Bad response from server");
		}
		rank = await rank.json();

		const puuid = sum['puuid'];

		const con = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});

		let ranksoloq = undefined;
		let rankflex = undefined;

		if (Object.keys(rank).length > 0) {
			for (let i = 0; i < Object.keys(rank).length; i++) {
				if (rank[i]["queueType"] === "RANKED_SOLO_5x5") {
					ranksoloq = rank[i];
				}
				else if (rank[i]["queueType"] === "RANKED_FLEX_SR") {
					rankflex = rank[i];
				}
			}
		}

		if (ranksoloq === undefined) {
			ranksoloq = {};
			ranksoloq['tier'] = 'N/A';
			ranksoloq['rank'] = '';
			ranksoloq['leaguePoints'] = 0;
			ranksoloq['wins'] = 0;
			ranksoloq['losses'] = 0;
		}

		if (rankflex === undefined) {
			rankflex = {};
			rankflex['tier'] = 'N/A';
			rankflex['rank'] = '';
			rankflex['leaguePoints'] = 0;
			rankflex['wins'] = 0;
			rankflex['losses'] = 0;
		}

		const req = 'INSERT INTO accounts VALUES (' + '"' + puuid + '", "' + sum['name'] + '", ' + sum['summonerLevel'] + ', ' + sum['profileIconId'] + ', "' + ranksoloq['tier'] + ' ' + ranksoloq['rank'] + '", ' + ranksoloq['leaguePoints'] + ', ' + ranksoloq['wins'] + ', ' + ranksoloq['losses'] + ', "' + rankflex['tier'] + ' ' + rankflex['rank'] + '", ' + rankflex['leaguePoints'] + ', ' + rankflex['wins'] + ', ' + rankflex['losses'] + ');';
		await con.connect(function(err) {
			if (err) throw err;
			con.query(req, async function(err) {
				if (err) {
					if (err.toString().includes("ER_DUP_ENTRY")) {
						await interaction.reply({ content: "Le compte est déjà enregistré", ephemeral: true });
					}
					else {
						throw err;
					}
				}
				else {
					await interaction.reply({ content: "Le compte a été ajouté", ephemeral: true });
				}
			});
		});
	},
};