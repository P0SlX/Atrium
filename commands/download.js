const { SlashCommandBuilder } = require('@discordjs/builders');
const { spawn } = require('node:child_process');
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { ButtonStyle } = require("discord-api-types/v8");
const fs = require("fs");
const tinyurl = require("../utils/tinyurl.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('download')
        .setDescription('Télécharge la vidéo')
        .addStringOption(option => option.setName('video').setDescription("Lien de la vidéo").setRequired(true)),
    async execute(interaction) {
        // differ reply
        await interaction.reply({ content: "Récupération des données en cours...", ephemeral: true });

        const video = interaction.options.getString('video');
        // Writing to file because stdout buffer cannot handle so much data
        const ytdlp = spawn('timeout', ['30', 'yt-dlp', '--write-info-json', '--skip-download', '-o', `/tmp/${interaction.id}`, video]);

        ytdlp.stdout.on('close', async () => {
            const data = JSON.parse(fs.readFileSync(`/tmp/${interaction.id}.info.json`).toString());

            const slicedFormats = data["formats"].slice(-5);

            const urls = slicedFormats.map(format => format.url.length > 512 ? tinyurl(format.url) : format.url);
            const tinyurls = await Promise.all(urls);
            // Replace urls with tinyurls
            slicedFormats.forEach((format, index) => format.url = tinyurls[index]);

            const buttons = new ActionRowBuilder();
            for (const format of slicedFormats) {
                let label = format["height"] + "p";
                if (format["fps"]) label += " " + format["fps"] + "fps";
                buttons.addComponents(
                    new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel(label)
                        .setURL(format["url"]));
            }

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
