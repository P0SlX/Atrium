const { SlashCommandBuilder, ButtonBuilder } = require('@discordjs/builders');
const { search, getTrailers } = require("../utils/tmdb");
const { ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { ButtonStyle } = require("discord-api-types/v10");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tmdb')
        .setDescription('Recherche sur TMDB')
        .addStringOption(option => option.setName('type').setDescription('Type de contenu')
            .addChoices(
                { name: 'Film', value: 'movie' },
                { name: 'Série', value: 'tv' },
            ).setRequired(true),
        )
        .addStringOption(option => option.setName('nom').setDescription("Nom").setRequired(true)),
    async execute(interaction) {

        const type = interaction.options.getString('type');
        const name = interaction.options.getString('nom');

        const res = await search(type, name);

        if (res.length === 0) {
            return interaction.reply({ content: "Aucun résultat", ephemeral: true });
        }

        // Create embed for each result
        const embeds = res.map((result) => {
            const embed = new EmbedBuilder()
                .setTitle(result.title)
                .setURL(`https://www.themoviedb.org/${type}/${result.id}`)
                .setColor("#0CB5DF")
                .setFields([
                    { name: "Date de sortie", value: result.release, inline: true },
                    { name: "Note", value: result.vote.toString(), inline: true },
                    { name: "Genres", value: result.genres.toString(), inline: true },
                ]);

            if (result.overview.length > 0) {
                embed.setDescription(result.overview);
            }

            if (result.poster) {
                embed.setImage(`https://image.tmdb.org/t/p/w500${result.poster}`);
            }

            return embed;
        });

        // Create buttons (previous, next, select)
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Précédent')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Suivant')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('select')
                    .setLabel('Valider')
                    .setStyle(ButtonStyle.Success),
            );

        // Send message with embed and buttons
        const message = await interaction.reply({
            embeds: [embeds[0]],
            components: [buttons],
            fetchReply: true,
            ephemeral: true,
        });

        // Create collector
        const collector = message.createMessageComponentCollector({
            filter: (interaction) => interaction.user.id === interaction.user.id,
            time: 60000,
        });

        // Create variables to keep track of current page and selected result
        let currentPage = 0;
        let selectedResult = null;

        // Handle collector events
        collector.on('collect', async (i) => {
            switch (i.customId) {
            case 'previous':
                if (currentPage > 0) {
                    currentPage--;
                    await i.update({ embeds: [embeds[currentPage]], ephemeral: true });
                }
                break;
            case 'next':
                if (currentPage < embeds.length - 1) {
                    currentPage++;
                    await i.update({ embeds: [embeds[currentPage]], ephemeral: true });
                }
                break;
            case 'select':
                selectedResult = embeds[currentPage];
                collector.stop();
                break;
            }
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                return interaction.editReply({ content: "Abandon...", components: [], ephemeral: true });
            }

            // Trailer
            const trailers = await getTrailers(res[currentPage].id, type);
            const payload = {
                embeds: [selectedResult],
            }
            if (trailers.length > 0) {
                const trailerButton = new ActionRowBuilder();
                for (const trailer of trailers) {
                    trailerButton.addComponents(
                        new ButtonBuilder()
                            .setLabel(trailer.name)
                            .setStyle(ButtonStyle.Link)
                            .setURL(trailer.url),
                    );
                }
                payload.components = [trailerButton];
            }

            interaction.channel.send(payload);
            return interaction.deleteReply();
        });
    },
};
