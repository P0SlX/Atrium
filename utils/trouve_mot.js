const urlBase = 'https://trouve-mot.fr/api/';

module.exports = {
    random: async (count = 1) => {
        return await fetch(urlBase.concat('random/').concat(count.toString()))
            .then((response) => response.json());
    },

    startWith: async (startString, count) => {
        return await fetch(urlBase.concat('startwith/').concat(`${startString}/`).concat(count.toString()))
            .then((response) => response.json());
    },

    daily: async () => {
        return await fetch(urlBase.concat('daily/'))
            .then((response) => response.json());
    }
};