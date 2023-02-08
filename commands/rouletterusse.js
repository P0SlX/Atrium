const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rouletterusse')
        .setDescription('Une chance sur 6 de te faire ban'),
    async execute(interaction) {
        const random = Math.floor(Math.random() * 6) + 1;

        if (random === 1) {
            await interaction.reply('Padpo');
            await interaction.guild.members.kick(interaction.user.id, { reason: 'Roulette russe' });
        }
        else {
            await interaction.reply('La chonce');
        }
    },
};
