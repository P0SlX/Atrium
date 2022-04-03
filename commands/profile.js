const {SlashCommandBuilder} = require('@discordjs/builders');
const mysql = require('mysql');
const {MessageEmbed} = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Affiche un profile lol')
        .addStringOption(option => option.setName('pseudo').setDescription('Profile à regarder').setRequired(true)
            .addChoice('Florian', 'P0SlX')
            .addChoice('Xavier', 'AIiasss')
            .addChoice('Matteis', 'KC Mateus')
            .addChoice('Erwan', 'CümStørm')
            .addChoice('Dydou', 'KC Dydou')
            .addChoice('Hugo', '1 Trick Zouglou')
            .addChoice('Quentin', 'Kata go brrr')
            .addChoice('Dariusz', 'KC Monke')
            .addChoice('Thomas', 'Spërmasturm')
        ),
    async execute(interaction) {

        let param;
        if (/\s/.test(interaction.options.getString('pseudo'))) {
            param = encodeURIComponent(interaction.options.getString('pseudo').trim());
            console.log(param);
        } else {
            param = interaction.options.getString('pseudo');
        }

        let sum = undefined;
        await fetch('https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + param + '?api_key=RGAPI-51d60eda-093b-4e89-8b9b-f04f7ae8b1f4')
            .then(async response => sum = await response.json());

        if (sum.status >= 400) {
            throw new Error("Bad response from server");
        }

        const puuid = sum['puuid']

        const con = mysql.createConnection({
            host: "141.147.19.210",
            user: "statslol",
            password: "hCYG6]0*4@iE(yZ)",
            database: "statslol"
        });

        await con.connect(function (err) {
            if (err) throw err;

            const req = `SELECT SUM(kills), SUM(deaths), SUM(assists), summoner_name, SUM(total_minions_killed), SUM(gold_earned), AVG(kill_participation) 
                         FROM matchs
                         WHERE idsum='${puuid}'`;

            con.query(req, async function (err, result, fields) {
                if (err) throw err;
                const kills = result[0]['SUM(kills)'];
                const deaths = result[0]['SUM(deaths)'];
                const assists = result[0]['SUM(assists)'];
                const summonerName = result[0]['summoner_name'];
                const totalcs = result[0]['SUM(total_minions_killed)'];
                const golde = result[0]['SUM(gold_earned)'];
                const kp = result[0]['AVG(kill_participation)'];

                const profile = new MessageEmbed()
                    .setColor("#0099ff")
                    .setTitle(summonerName)
                    .setURL("https://euw.op.gg/summoners/euw/" + param)
                    .setDescription("Stats de " + summonerName)
                    .addField('KDA', ((kills + assists) / deaths).toFixed(2), false)
                    .addField('Kills', kills.toString(), true)
                    .addField('Deaths', deaths.toString(), true)
                    .addField('Assists', assists.toString(), true)
                    .addField('Minions tués', totalcs.toString(), true)
                    .addField('Gold gagnés', golde.toString(), true)
                    .addField('Kills participation', kp.toFixed(2), true)
                    .setTimestamp(new Date());

                await interaction.reply({embeds: [profile]});
            });
        });
    },
};