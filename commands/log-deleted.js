const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require("discord.js");

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

                    const embed = new EmbedBuilder()
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
                            embed.addFields(
                                { name: '\u200B', value: user, inline: true },
                                { name: '\u200B', value: rows[i].message.substring(0, 1024), inline: true },
                                { name: '\u200B', value: dateString, inline: true },
                            );
                        }
                        else {
                            embed.addFields(
                                { name: "User (#channel)", value: user, inline: true },
                                { name: "Message", value: rows[i].message.substring(0, 1024), inline: true },
                                { name: "Date", value: dateString, inline: true },
                            );
                        }
                    }

                    embed.setTimestamp(new Date());
                    return interaction.reply({ embeds: [embed] });
                });
        });
    },
};
