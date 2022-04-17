const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nsfw')
		.setDescription('Tkt')
		.addStringOption(option => option.setName('categorie').setDescription('Catégorie du contenu').setRequired(true)
			.addChoice('Hentai', 'hentai')
			.addChoice('Ass', 'ass')
			.addChoice('GIF', 'pgif')
			.addChoice('Thigh', 'thigh')
			.addChoice('Hentai Ass', 'hass')
			.addChoice('Hentai Boobs', 'hboobs')
			.addChoice('Boobs', 'boobs')
			.addChoice('Pussy', 'pussy')
			.addChoice('Paizuri', 'paizuri')
			.addChoice('Hentai Thigh', 'hthigh')
			.addChoice('Anal', 'anal')
			.addChoice('Blowjob', 'blowjob')
			.addChoice('Gonewild', 'gonewild')
			.addChoice('4K', '4k'),
		),
	async execute(interaction) {
		const logger = global.LOGGER;

		if (!interaction.channel.nsfw) {
			logger.info(`${interaction.user.username} à essayé de faire un /nsfw mais n'est pas dans un channel nsfw`);
			return interaction.reply({
				content: 'Cette commande ne peut être utilisée que dans un salon NSFW.',
				ephemeral: true,
			});
		}

		let categorie = interaction.options.getString('categorie');
		const url = `https://nekobot.xyz/api/image?type=${categorie}`;
		let imgURL = "";

		try {
			const response = await fetch(url);
			const json = await response.json();
			imgURL = json.message;
		} catch (e) {
			logger.error(e);
			interaction.reply({ content: 'Une erreur est survenue lors de la récupération de l\'image.' });
		}

		const embed = new MessageEmbed()
			.setColor('#FF0000')
			.setURL(imgURL)
			.setTimestamp(new Date())
			.setImage(imgURL);

		logger.info(`${interaction.user.username} à utilisé /nsfw`);
		interaction.reply({ embeds: [embed] });
	}
};
