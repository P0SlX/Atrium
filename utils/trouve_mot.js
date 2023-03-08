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
    },

    category: async (categoryString, count) => {
        return await fetch(urlBase.concat('categorie/').concat(`${categoryString}/`).concat(count.toString()))
            .then((response) => response.json());
    },

    size: async (sizeString, count) => {
        return await fetch(urlBase.concat('size/').concat(`${sizeString}/`).concat(count.toString()))
            .then((response) => response.json());
    },

    sizeMin: async (sizeString, count) => {
        return await fetch(urlBase.concat('sizemin/').concat(`${sizeString}/`).concat(count.toString()))
            .then((response) => response.json());
    },

    sizeMax: async (sizeString, count) => {
        return await fetch(urlBase.concat('sizemax/').concat(`${sizeString}/`).concat(count.toString()))
            .then((response) => response.json());
    }
};