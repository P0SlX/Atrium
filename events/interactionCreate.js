module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const client = global.CLIENT;
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        const logger = global.LOGGER;

        await command.execute(interaction)
            .catch(error => {
                logger.error(error);
                interaction.reply({ content: 'Ya un problème avec la commande...', ephemeral: true });
            });
    },
};
