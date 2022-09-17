const axios = require('axios');
const { tinyurlApiKey } = require("../config.json");
const { stringify } = require("nodemon/lib/utils");

module.exports = async (url) => {
    const logger = global.LOGGER;
    const data = {
        url: url,
        domain: null,
        alias: null,
        tags: null,
        expires_at: null,
    };

    return await axios.post(`https://api.tinyurl.com/create?api_token=${tinyurlApiKey}`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }).then((response) => {
        return response.data["data"]["tiny_url"];
    }).catch((err) => {
        logger.error(err);
        console.error(err);
        return false;
    });
};