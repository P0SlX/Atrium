const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { EmbedBuilder } = require('discord.js');
const { host, user, password, database } = require('../config.json');
const riot_api = require('../utils/riot_api')


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Affiche un profile lol')
		.addStringOption(option => option.setName('pseudo').setDescription('Profile à regarder').setRequired(true)),
	async execute(interaction) {
		const res = await riot_api(interaction, true);
		if (res === undefined) return;

		const logger = global.LOGGER;

		const con = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});

		await con.connect(function(err) {
			if (err) {
				logger.error(err);
				console.error(err);
			}

			const req = `SELECT SUM(kills),
                                SUM(deaths),
                                SUM(assists),
                                summoner_name,
                                SUM(total_minions_killed),
                                SUM(gold_earned),
                                AVG(kill_participation),
                                COUNT(idgame)
                         FROM matchs
                         WHERE idsum = '${res["sum"]['puuid']}'`;

			con.query(req, async function(err, result) {
				if (err) {
					logger.error(err);
					console.error(err);
				}

				const kills = result[0]['SUM(kills)'];
				const deaths = result[0]['SUM(deaths)'];
				const assists = result[0]['SUM(assists)'];
				const summonerName = result[0]['summoner_name'];
				const totalcs = result[0]['SUM(total_minions_killed)'];
				const golde = result[0]['SUM(gold_earned)'];
				const kp = result[0]['AVG(kill_participation)'];
				const nbgames = result[0]['COUNT(idgame)'];


				let ranksoloq = "N/A";
				for (const r of res["rank"]) {
					if (r.queueType === "RANKED_SOLO_5x5") {
						ranksoloq = r["tier"] + " " + r["rank"] + " " + r["leaguePoints"] + " LP";
					}
				}

				const profile = new EmbedBuilder()
					.setColor("#0099ff")
					.setTitle(summonerName)
					.setURL(`https://euw.op.gg/summoners/euw/${res["sum"]["summonerName"]}`)
					.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${res["version"]}/img/profileicon/${res["sum"]["profileIconId"]}.png`)
					.setDescription(`Stats de ${summonerName}`)
					.addFields(
						{ name: "KDA", value: ((kills + assists) / deaths).toFixed(2), inline: false },
						{ name: "Soloq rank", value: ranksoloq, inline: false },
						{ name: "Kills", value: kills.toString(), inline: true },
						{ name: "Deaths", value: deaths.toString(), inline: true },
						{ name: "Assists", value: assists.toString(), inline: true },
						{ name: "Minions tués", value: totalcs.toString(), inline: true },
						{ name: "Gold gagnés", value: golde.toString(), inline: true },
						{ name: "Kills participation", value: kp.toFixed(2), inline: true },
					)
					.setFooter({ text: `Données basées sur ${nbgames} games` })
					.setTimestamp(new Date());

				logger.info(`${interaction.user.username} a utilisé /profile | Profile de ${summonerName} envoyé`);
				await interaction.reply({ embeds: [profile] });
			});
		});
	},
};