const { SlashCommandBuilder } = require('@discordjs/builders');
const mysql = require('mysql');
const { MessageEmbed } = require('discord.js');
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

		const con = mysql.createConnection({
			host: host,
			user: user,
			password: password,
			database: database,
		});

		await con.connect(function(err) {
			if (err) throw err;

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
				if (err) throw err;
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

				const profile = new MessageEmbed()
					.setColor("#0099ff")
					.setTitle(summonerName)
					.setURL(`https://euw.op.gg/summoners/euw/${res["sum"]["summonerName"]}`)
					.setThumbnail(`http://ddragon.leagueoflegends.com/cdn/${res["version"]}/img/profileicon/${res["sum"]["profileIconId"]}.png`)
					.setDescription(`Stats de ${summonerName}`)
					.addField('KDA', ((kills + assists) / deaths).toFixed(2), false)
					.addField('Soloq rank', ranksoloq, false)
					.addField('Kills', kills.toString(), true)
					.addField('Deaths', deaths.toString(), true)
					.addField('Assists', assists.toString(), true)
					.addField('Minions tués', totalcs.toString(), true)
					.addField('Gold gagnés', golde.toString(), true)
					.addField('Kills participation', kp.toFixed(2), true)
					.setFooter({ text: `Données basées sur ${nbgames} games` })
					.setTimestamp(new Date());

				await interaction.reply({ embeds: [profile] });
			});
		});
	},
};