const { SlashCommandBuilder } = require('@discordjs/builders');
const { random, startWith, daily } = require('../utils/trouve_mot');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mot')
        .setDescription('Trouve un mot au hasard')
        .addSubcommand(subcommand => subcommand
            .setName("random")
            .setDescription("Au hasard")
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("startwith")
            .setDescription("Mot commençant par...")
            .addStringOption(option => option.setName('letters').setDescription('Lettre(s) de départ').setRequired(true))
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("daily")
            .setDescription("Mot du jour")),
    async execute(interaction) {
        await interaction.deferReply();
        let count = 1;
        if (interaction.options.getInteger('count')) {
            count = interaction.options.getInteger('count');
        }

        const user = interaction.user;
        let description = '';
        let response = [];

        switch (interaction.options.getSubcommand()) {
        case 'random':
            description = 'Mot au hasard';
            response = await random(count);
            break;
        case 'startwith':
            description = 'Mot commençant par...';
            const startString = interaction.options.getString('letters');
            response = await startWith(startString, count);
            break;
        case 'daily':
            description = 'Mot du jour';
            response = [await daily()];
            break;
        }

        if (response.length === 0) {
            await interaction.editReply({ content: 'Aucun mot trouvé' });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#FF2950')
                .setTitle(description)
                .setTimestamp(new Date())
                .setFooter({
                    text: `Envoyé par ${user.username}`,
                    iconURL: user.avatarURL({ dynamic: true }),
                });

            for (let i = 0; i < Math.min(response.length, 25); i++) {
                embed.addFields({
                    name: `Mot ${i + 1}`,
                    value: response[i]["name"].toString(),
                    inline: true,
                });
            }
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e);
        }
    },
};
