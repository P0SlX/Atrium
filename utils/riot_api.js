const { apiKey } = require("../config.json");
const axios = require('axios');

module.exports = async (interaction, needVersion) => {
    const logger = global.LOGGER;
    const param = encodeURIComponent(interaction.options.getString('pseudo').trim());
    let res = {};

    await axios.get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${param}?api_key=${apiKey}`)
        .then(async (response) => {
            res.sum = response.data;
            await axios.get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${response.data.id}?api_key=${apiKey}`)
                .then((response) => {
                    res.rank = response.data
                });
        })
        .catch((err) => {
            logger.error(err);
            console.error(err);
            interaction.reply({ content: "Erreur lors de la récupération des données", ephemeral: true });
            return false;
        });

    if (needVersion) {
        await axios.get(`https://ddragon.leagueoflegends.com/api/versions.json`)
            .then((response) => {
                res.version = response.data[0];
            });
    }
    return res;
};