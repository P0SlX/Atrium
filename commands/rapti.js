const { SlashCommandBuilder } = require('@discordjs/builders');
const { rapti } = require('../resources/rapti.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ratpi')
		.setDescription('Le DUC’ZER en personne'),
	async execute(interaction) {
		const txt = rapti[Math.floor(Math.random() * rapti.length)];
		return interaction.reply({ content: txt });
	},
};
