const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageEmbed} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log-deleted')
        .setDescription('Affiche les derniers messages supprimés'),
    async execute(interaction) {
        const db = global.DB;

        // Requete SQL
        db.serialize(() => {
            db.all(`SELECT *
                    FROM deleted
                    ORDER BY deleted.date DESC`,
                async (err, rows) => {
                    if (err) {
                        console.error(err.message);
                        return;
                    }

                    if (rows.length === 0)
                        return interaction.reply({content: "Aucun messages supprimés..."});


                    const embed = new MessageEmbed()
                        .setColor('#E47A7A')
                        .setTitle("Messages supprimés")
                        .setURL("https://www.youtube.com/watch?v=dQw4w9WgXcQ");

                    // Construction de l'embed
                    for (let i = 0; i < Math.min(rows.length, 8); ++i) {
                        const user = await interaction.guild.members.fetch(rows[i].userId)
                        const date = new Date(rows[i].date).toLocaleDateString("fr-FR", {
                            hour: "numeric",
                            minute: "numeric"
                        });

                        if (i > 0) {
                            embed.addField("\u200b", user.user.username, true);
                            embed.addField("\u200b", rows[i].message.substring(0, 1024), true);
                            embed.addField("\u200b", date, true);
                        } else {
                            embed.addField("User", user.user.username, true);
                            embed.addField("Message", rows[i].message.substring(0, 1024), true);
                            embed.addField("Date", date, true);
                        }
                    }

                    embed.setTimestamp(new Date())
                        .setFooter({
                            text: `Logs demandé par ${interaction.member.user.username}`,
                            iconURL: interaction.member.user.avatarURL({dynamic: true})
                        });

                    return interaction.reply({embeds: [embed]});
                });
        });
    },
};
