const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rot13')
        .setDescription('Encode/Décode un message grâce au ROT13')
        .addSubcommand(subcommand => subcommand
            .setName("encoder")
            .setDescription("Encoder en ROT13")
            .addStringOption(option => option.setName('message').setDescription('Message').setRequired(true)))
        .addSubcommand(subcommand => subcommand
            .setName("decoder")
            .setDescription("Décoder du ROT13")
            .addStringOption(option => option.setName('message').setDescription('Message').setRequired(true))),
    async execute(interaction) {
        const input_msg = interaction.options.getString('message');

        let input = "", output = "";

        if (interaction.options.getSubcommand() === "encoder") {
            input = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            output = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
        }
        else if (interaction.options.getSubcommand() === "decoder") {
            input = 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm';
            output = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        }

        const index = x => input.indexOf(x);
        const translate = x => index(x) > -1 ? output[index(x)] : x;
        const output_msg = input_msg.split('').map(translate).join('');

        return interaction.reply({ content: output_msg });
    },
};
