const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('altcaps')
        .setDescription('cRaFt uN mEsSaGe cOmMe Ca')
        .addStringOption(option => option.setName('message').setDescription("Jsais pas quoi mettre comme description").setRequired(true)),
    async execute(interaction) {
        const input_msg = interaction.options.getString('message');

        let output_msg = "";
        for (let i = 0; i < input_msg.length; i++) {
            if (i % 2 === 0) {
                output_msg += input_msg[i].toUpperCase();
            }
            else {
                output_msg += input_msg[i].toLowerCase();
            }
        }

        return interaction.reply({ content: output_msg, ephemeral: true });
    },
};
