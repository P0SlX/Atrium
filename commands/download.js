const { SlashCommandBuilder } = require('@discordjs/builders');
const { spawn } = require('node:child_process');
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { ButtonStyle } = require("discord-api-types/v10");
const fs = require("fs");
const { get } = require("../utils/https");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Télécharge la vidéo')
        .addStringOption(option => option.setName('video').setDescription("Lien de la vidéo").setRequired(true)),
    async execute(interaction) {
        await interaction.reply({ content: "Récupération des données en cours...", ephemeral: true });

        const video = interaction.options.getString('video');
        // Writing to file because stdout buffer cannot handle so much data
        const ytdlp = spawn('timeout', ['30', 'yt-dlp', '--write-info-json', '--skip-download', '-o', `/tmp/${interaction.id}`, video]);

        ytdlp.stdout.on('close', async () => {
            const data = JSON.parse(fs.readFileSync(`/tmp/${interaction.id}.info.json`).toString());

            const slicedFormats = data["formats"].slice(-5);

            // Discord does not support link longer than 512 characters, so we need to shorten it
            const urls = slicedFormats.map(format => format.url.length > 512 ? get(`https://tinyurl.com/api-create.php?url=${format.url}`) : format.url);
            const tinyurls = await Promise.all(urls);
            // Replace urls with tinyurls
            slicedFormats.forEach((format, index) => format.url = tinyurls[index]);

            const buttons = new ActionRowBuilder();

            slicedFormats.forEach(format => {
                let label = format["height"] + "p";
                if (format["fps"]) label += " " + format["fps"] + "fps";
                buttons.addComponents(new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel(label)
                    .setURL(format["url"]));
            });

            // Better handle this
            const author = data["uploader"] ? data["uploader"] : data["creator"];

            await interaction.editReply({
                content: `**${data["extractor_key"]}** | ${data["title"]} - *${author}*`,
                components: [buttons],
                ephemeral: true,
            });
        });

        // Try to delete JSON, if it exists
        try {
            fs.unlinkSync(`/tmp/${interaction.id}.info.json`);
        } catch (err) {
        }
    },
};
