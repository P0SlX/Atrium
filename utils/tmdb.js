const { tmdbApiKey } = require('../config.json');
const axios = require('axios');

const genresList = {
    28: 'Action',
    12: 'Aventure',
    16: 'Animation',
    35: 'Comédie',
    80: 'Crime',
    99: 'Documentaire',
    18: 'Drame',
    10751: 'Familial',
    14: 'Fantastique',
    36: 'Histoire',
    27: 'Horreur',
    10402: 'Musique',
    9648: 'Mystère',
    10749: 'Romance',
    878: 'Science-Fiction',
    10770: 'Téléfilm',
    53: 'Thriller',
    10752: 'Guerre',
    10759: 'Action & Aventure',
    10762: 'Enfants',
    10763: 'News',
    10764: 'Réalité',
    10765: 'Science-Fiction & Fantastique',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'Guerre & Politique',
    37: 'Western',
};

function getGenres(ids) {
    return ids.map((id) => genresList[id]).join(', ');
}

class BaseObject {
    constructor(data) {
        this.overview = data.overview.length > 4000 ? data.overview.slice(0, 3997) + "..." : data.overview;
        this.poster = data.poster_path;
        this.vote = data.vote_average === 0 ? "Inconnue" : data.vote_average;
        this.genres = getGenres(data.genre_ids) || "Inconnu";
        this.id = data.id;
    }
}

class Movie extends BaseObject {
    constructor(data) {
        super(data);
        this.title = data.title.length > 256 ? data.title.slice(0, 253) + "..." : data.title;
        this.release = data.release_date ? new Date(data.release_date).toLocaleDateString() : "Inconnue";
    }
}

class TvShow extends BaseObject {
    constructor(data) {
        super(data);
        this.title = data.name.length > 256 ? data.name.slice(0, 253) + "..." : data.name;
        this.release = data.first_air_date ? new Date(data.first_air_date).toLocaleDateString() : "Inconnue";
    }
}

class Trailer {
    constructor(name, key) {
        this.name = name;
        this.url = `https://www.youtube.com/watch?v=${key}`;
    }
}

async function search(type, searchContent) {
    const url = `https://api.themoviedb.org/3/search/${type}?api_key=${tmdbApiKey}&query=${searchContent}&language=fr-FR&page=1&include_adult=true`;
    const res = await axios.get(url).then((res) => res.data);

    if (res.total_results === 0) {
        return null;
    }

    if (type === "movie") {
        return res.results.slice(0, 5).map((movie) => {
            return new Movie(movie);
        });
    }

    return res.results.slice(0, 5).map((movie) => {
        return new TvShow(movie);
    });
}

async function getTrailers(id, type) {
    const urlFr = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${tmdbApiKey}&language=fr-FR`;
    const urlEn = `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${tmdbApiKey}&language=en-US`;
    let resFr = await axios.get(urlFr).then((res) => res.data);
    let resEn = await axios.get(urlEn).then((res) => res.data);

    if (resFr.results.length === 0 && resEn.results.length === 0) {
        return null;
    }

    // Sort by name
    resFr.results.sort((a, b) => a.name.localeCompare(b.name));
    resEn.results.sort((a, b) => a.name.localeCompare(b.name));

    // merge results
    const results = resFr.results.concat(resEn.results);

    // Keep only official trailers
    const trailers = results.filter((video) => video.type === "Trailer" && video.site === "YouTube" && video.official === true);

    if (trailers.length === 0) {
        return null;
    }

    return trailers.slice(0, 5).map((trailer) => {
        return new Trailer(trailer.name, trailer.key);
    });
}

module.exports = {
    search: search,
    getTrailers: getTrailers,
};