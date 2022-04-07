const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
// eslint-disable-next-line no-shadow
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { host, user, password, database } = require('../config.json');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Affiche un profile lol')
		.addStringOption(option => option.setName('pseudo').setDescription('Profile à regarder').setRequired(true)),
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

		let version = 0;
		await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
			.then(async response => version = await response.json());
		if (version.status >= 400) {
			throw new Error("Bad response from server");
		}
		version = version[0];

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

		await con.connect(function(err) {
			if (err) throw err;

			const req = `SELECT SUM(kills), SUM(deaths), SUM(assists), summoner_name, SUM(total_minions_killed), SUM(gold_earned), AVG(kill_participation), COUNT(idgame) 
                         FROM matchs
                         WHERE idsum='${puuid}'`;

			con.query(req, async function(err, result) {
				if (err) throw err;
				const kills = result[0]['SUM(kills)'];
				const deaths = result[0]['SUM(deaths)'];
				const assists = result[0]['SUM(assists)'];
				const summonerName = result[0]['summoner_name'];
				const totalcs = result[0]['SUM(total_minions_killed)'];
				const golde = result[0]['SUM(gold_earned)'];
				const kp = result[0]['AVG(kill_participation)'];
				const nbgames = result[0]['COUNT(idgame)'];

				let ranksoloq = "";

				if (Object.keys(rank).length == 0) {
					ranksoloq = 'N/A';
				}
				else {
					for (let i = 0; i < Object.keys(rank).length; i++) {
						if (rank[i]["queueType"] === "RANKED_SOLO_5x5") {
							ranksoloq = rank[i]["tier"] + " " + rank[i]["rank"] + " " + rank[i]["leaguePoints"] + " LP";
						}
						else {
							ranksoloq = 'N/A';
						}
					}
				}

				const profile = new MessageEmbed()
					.setColor("#0099ff")
					.setTitle(summonerName)
					.setURL("https://euw.op.gg/summoners/euw/" + param)
					.setThumbnail("http://ddragon.leagueoflegends.com/cdn/" + version + "/img/profileicon/" + sum["profileIconId"] + ".png")
					.setDescription("Stats de " + summonerName)
					.addField('KDA', ((kills + assists) / deaths).toFixed(2), false)
					.addField('Soloq rank', ranksoloq, false)
					.addField('Kills', kills.toString(), true)
					.addField('Deaths', deaths.toString(), true)
					.addField('Assists', assists.toString(), true)
					.addField('Minions tués', totalcs.toString(), true)
					.addField('Gold gagnés', golde.toString(), true)
					.addField('Kills participation', kp.toFixed(2), true)
					.setFooter({ text: 'Données basées sur ' + nbgames + ' games' })
					.setTimestamp(new Date());

				await interaction.reply({ embeds: [profile] });
			});
		});
	},
};