const {SlashCommandBuilder} = require('@discordjs/builders');
const exec = require('child_process').exec;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong Ching Chong')
        .addStringOption(option => option.setName('ip').setDescription('IP / domaine à ping')
            .addChoice('League of Legends', 'euw.leagueoflegends.com')
            .addChoice('Discord', 'discord.com')
            .addChoice('Twitter', 'twitter.fr')
            .addChoice('Google', 'google.fr')
            .addChoice('Cloudflare', '1.1')
        )
        .addIntegerOption(option => option.setName('count').setDescription("Nombre de ping à envoyer")),
    async execute(interaction) {
        let ip = "1.1";
        let c = 5;

        if (interaction.options.getString('ip')) ip = interaction.options.getString('ip');
        if (interaction.options.getInteger('count')) c = interaction.options.getInteger('count');

        await interaction.reply(`Ping de \`${ip}\` en cours...`);
        exec(`ping ${ip} -i 0.2 -c ${c} | grep -B 1 avg`, {timeout: 30000}, async (error, stdout, stderr) => {
            if (error || stderr) {
                await interaction.editReply({content: `Impossible de ping ${ip}`});
                return;
            }
            const tmp = stdout.split(' ');
            const packetLoss = tmp[5];
            const pings = tmp[12].split('/');
            const minPing = pings[0];
            const avgPing = pings[1];
            const maxPing = pings[2];
            return interaction.editReply(`IP : \`${ip}\`\ncount : \`${c}\`\nmin : \`${minPing}\`ms / avg : \`${avgPing}\`ms / max : \`${maxPing}\`ms\nPacket loss : \`${packetLoss}\``);
        });
    },
};
