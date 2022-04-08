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
				return interaction.reply({ content: 'Ya un problème avec la commande...' });
			} catch (error) {
				console.error(error);
			}
		}
	},
};
