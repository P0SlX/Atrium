const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Randint un nombre entre 1 et x')
        .addIntegerOption(option => option.setName('nombre').setDescription("Nombre max").setRequired(true)),
    async execute(interaction) {
        const number = interaction.options.getInteger('nombre');

        if (number < 2) {
            await interaction.reply({ content: "Le nombre doit être supérieur à 1", ephemeral: false });
        }
        else {
            const randomNumber = Math.floor(Math.random() * number) + 1;
            await interaction.reply({ content: `${randomNumber}`, ephemeral: false });
        }
    },
};