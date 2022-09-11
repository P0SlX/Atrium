const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear les messages (maximum de 14 jours)')
        .addIntegerOption(option => option.setName('nombre').setDescription('Nombre de messages [1-100]').setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {
            return interaction.reply({
                content: "Tu n'as pas la permission d'effectuer cette commande, demande à un connard d'amin",
                ephemeral: true,
            });
        }

        const amount = interaction.options.getInteger('nombre');

        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Entres un nombre entre 1 et 99.', ephemeral: true });
        }

        await interaction.channel.bulkDelete(amount, true).catch(error => {
            console.error(error);
            global.LOGGER.info(`${interaction.user.username} a essayé de clear ${amount} messages dans ${interaction.channel.name} mais il y a eu un problème.`);
            interaction.reply({ content: 'Echec de la suppression de messages...', ephemeral: true });
        });

        global.LOGGER.info(`${interaction.user.username} a utilisé la commande clear et a supprimé ${amount} messages`);
        return interaction.reply({ content: `\`${amount}\` messages ont été supprimés.`, ephemeral: true });
    },
};
