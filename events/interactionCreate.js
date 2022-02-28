module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute(interaction) {
        if (!interaction.isCommand()) return;

        const client = global.CLIENT;
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            try {
                return interaction.reply({content: '<@200227803189215232> Ya une couille dans le pâté là...'});
            } catch (error) {
                console.error(error);
            }
        }
    },
};
