const { apiKey } = require("../config.json");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = async (interaction, needVersion) => {
    const logger = global.LOGGER;
    const param = encodeURIComponent(interaction.options.getString('pseudo').trim());
    let res = {};

    try {
        const sum = await fetch(`https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${param}?api_key=${apiKey}`)
            .then(async response => {
                if (response.status >= 400) {
                    logger.error(`${response.status} - ${response.statusText}`);
                    console.error(`${response.status} - ${response.statusText}`);
                }
                return await response.json();
            });

        if (needVersion) {
            res["version"] = await fetch('https://ddragon.leagueoflegends.com/api/versions.json')
                .then(async response => {
                        if (response.status >= 400) {
                            logger.error(`${response.status} - ${response.statusText}`);
                            console.error(`${response.status} - ${response.statusText}`);
                        }
                        return await response.json().then(json => {
                            return json[0];
                        });
                    },
                );
        }

        const rank = await fetch(`https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${sum["id"]}?api_key=${apiKey}`)
            .then(async response => {
                if (response.status >= 400) {
                    logger.error(`${response.status} - ${response.statusText}`);
                    console.error(`${response.status} - ${response.statusText}`);
                }
                return await response.json();
            });

        res["sum"] = sum;
        res["rank"] = rank;
        return res;

    } catch (e) {
        logger.error(e);
        console.error(e);
        return interaction.reply({ content: `Mauvaise réponse du serveur : \`${e}\`` });
    }
};