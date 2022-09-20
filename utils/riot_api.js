const { apiKey } = require("../config.json");
const { get } = require("./https");

module.exports = async (interaction, needVersion) => {
    const logger = global.LOGGER;
    const param = encodeURIComponent(interaction.options.getString('pseudo').trim());
    let res = {};

    await get(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${param}?api_key=${apiKey}`)
        .then(async (response) => {
            res.sum = JSON.parse(response.toString());
            await get(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${res.sum.id}?api_key=${apiKey}`)
                .then((response) => res.rank = JSON.parse(response.toString()));
        })
        .catch((err) => {
            logger.error(err);
            console.error(err);
            interaction.reply({ content: "Erreur lors de la récupération des données", ephemeral: true });
            return false;
        });

    if (needVersion) {
        await get(`https://ddragon.leagueoflegends.com/api/versions.json`)
            .then((response) => res.version = JSON.parse(response.toString())[0]);
    }
    return res;
};