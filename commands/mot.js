const { SlashCommandBuilder } = require('@discordjs/builders');
const { random, startWith, daily, category, size, sizeMax, sizeMin } = require('../utils/trouve_mot');
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mot')
        .setDescription('Trouve un mot au hasard')
        .addSubcommand(subcommand => subcommand
            .setName("random")
            .setDescription("Au hasard")
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("startwith")
            .setDescription("Mot commençant par...")
            .addStringOption(option => option.setName('letters').setDescription('Lettre(s) de départ').setRequired(true))
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("daily")
            .setDescription("Mot du jour"))
        .addSubcommand(subcommand => subcommand
            .setName("category")
            .setDescription("Mot d'une catégorie")
            .addStringOption(option => option.setName('category').setDescription('Catégorie').setRequired(true)
                    .addChoices(
                        { name: '1 - L\'école - La classe - L\'instruction', value: '1'},
                        { name: '2 - Paysages - Climat - Formes', value: '2'},
                        { name: '3 - Qualités et défauts', value: '3'},
                        { name: '4 - Calcul et mesures', value: '4'},
                        { name: '5 - Les aliments - Les boissons - Les repas', value: '5'},
                        { name: '6 - Le corps humain', value: '6'},
                        { name: '7 - Les sens - La volonté - L\'intelligence', value: '7'},
                        { name: '8 - L\'intérieur et le mobilier', value: '8'},
                        { name: '9 - L\'industrie et le travail', value: '9'},
                        { name: '10 - Les arts', value: '10'},
                        { name: '11 - L\'agriculture', value: '11'},
                        { name: '12 - Verger - Bois - Chasse - Pêche', value: '12'},
                        { name: '13 - Gestes et mouvements', value: '13'},
                        { name: '14 - Époque - Temps - Saisons', value: '14'},
                        { name: '15 - Vêtements - Toilette - Parures', value: '15'},
                        { name: '16 - Sports et jeux', value: '16'},
                        { name: '17 - La maison - Le bâtiment', value: '17'},
                        { name: '18 - Les voyages', value: '18'},
                        { name: '19 - Les animaux', value: '19'},
                        { name: '20 - Ville - Village - Univers - Dimensions', value: '20'},
                        { name: '21 - Eaux - Minéraux - Végétaux', value: '21'},
                        { name: '22 - Le commerce', value: '22'},
                        { name: '23 - La communication', value: '23'},
                        { name: '24 - Joies et peines', value: '24'},
                        { name : '25 - Gouvernement et justice', value: '25'},
                    )
            ))
        .addSubcommand(subcommand => subcommand
            .setName("size")
            .setDescription("Mot d'une taille donnée")
            .addIntegerOption(option => option.setName('size').setDescription('Taille du mot').setRequired(true))
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("sizemin")
            .setDescription("Mot d'une taille donnée ou plus")
            .addIntegerOption(option => option.setName('size').setDescription('Taille du mot minimale').setRequired(true))
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots')))
        .addSubcommand(subcommand => subcommand
            .setName("sizemax")
            .setDescription("Mot d'une taille donnée ou moins")
            .addIntegerOption(option => option.setName('size').setDescription('Taille du mot maximale').setRequired(true))
            .addIntegerOption(option => option.setName('count').setDescription('Nombre de mots'))),
    async execute(interaction) {
        await interaction.deferReply();
        let count = 1;
        if (interaction.options.getInteger('count')) {
            count = interaction.options.getInteger('count');
        }

        const user = interaction.user;
        let description = '';
        let response = [];

        switch (interaction.options.getSubcommand()) {
        case 'random':
            description = 'Mot au hasard';
            response = await random(count);
            break;
        case 'startwith':
            description = 'Mot commençant par...';
            const startString = interaction.options.getString('letters');
            response = await startWith(startString, count);
            break;
        case 'daily':
            description = 'Mot du jour';
            response = [await daily()];
            break;
        case 'category':
            const categoryString = interaction.options.getString('category');
            description = `Mot de la catégorie ${categoryString}`;
            response = await category(categoryString, count);
            break;
        case 'size':
            const stringSize = interaction.options.getInteger('size');
            description = `Mot de taille ${stringSize}`;
            response = await size(stringSize, count);
            break;
        case 'sizemin':
            const stringSizeMin = interaction.options.getInteger('size');
            description = `Mot de ${stringSizeMin} lettres ou plus`;
            response = await sizeMin(stringSizeMin, count);
            break;
        case 'sizemax':
            const stringSizeMax = interaction.options.getInteger('size');
            description = `Mot de ${stringSizeMax} lettres ou moins`;
            response = await sizeMax(stringSizeMax, count);
            break;
        }

        if (response.length === 0) {
            await interaction.editReply({ content: 'Aucun mot trouvé' });
            return;
        }

        try {
            const embed = new EmbedBuilder()
                .setColor('#FF2950')
                .setTitle(description)
                .setTimestamp(new Date())
                .setFooter({
                    text: `Envoyé par ${user.username}`,
                    iconURL: user.avatarURL({ dynamic: true }),
                });

            for (let i = 0; i < Math.min(response.length, 25); i++) {
                embed.addFields({
                    name: `Mot ${i + 1}`,
                    value: response[i]["name"].toString(),
                    inline: true,
                });
            }
            await interaction.editReply({ embeds: [embed] });
        } catch (e) {
            console.log(e);
        }
    },
};
