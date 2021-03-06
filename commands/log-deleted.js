const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('log-deleted')
		.setDescription('Affiche les derniers messages supprimés'),
	async execute(interaction) {
		const db = global.DB;
		const logger = global.LOGGER;

		// Requete SQL
		db.serialize(() => {
			db.all(`SELECT *
                    FROM deleted
                    WHERE guildId = ${interaction.guildId}
                    ORDER BY deleted.date DESC`,
				async (err, rows) => {
					if (err) {
						logger.error(err);
						console.error(err.message);
						return;
					}

					logger.info(`${interaction.user.username} a utilisé la commande /log-deleted`);

					if (rows.length === 0) {
						return interaction.reply({ content: "Aucun messages supprimés..." });
					}

					const embed = new MessageEmbed()
						.setColor('#E47A7A')
						.setTitle("Messages supprimés")
						.setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

					// Construction de l'embed
					for (let i = 0; i < Math.min(rows.length, 8); ++i) {
						const userObj = await interaction.guild.members.fetch(rows[i].userId);
						const user = userObj.user.username + ` (#${rows[i].channel})`;
						const date = new Date(rows[i].date);
						const dateString = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}`;

						if (i > 0) {
							embed.addField("\u200b", user, true);
							embed.addField("\u200b", rows[i].message.substring(0, 1024), true);
							embed.addField("\u200b", dateString, true);
						}
						else {
							embed.addField("User (#channel)", user, true);
							embed.addField("Message", rows[i].message.substring(0, 1024), true);
							embed.addField("Date", dateString, true);
						}
					}

					embed.setTimestamp(new Date());
					return interaction.reply({ embeds: [embed] });
				});
		});
	},
};
