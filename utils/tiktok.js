const {MessageEmbed} = require("discord.js");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const download_video = require("./download_video");
const extract_url = require("./extract_url");

async function retreiveURL(message) {
    const url = await extract_url(message);

    // Recupère l'id de la vidéo en suitant les redirections
    const tmp = await fetch(url);
    const regexID = new RegExp(/\/([0-9]+)/i);
    let match = null;
    try {
        // Construction de l'url de l'API
        match = tmp.url.match(regexID)[1];
        return `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${match}`
    } catch (e) {
        // C'est certainement un profil ou un lien sans vidéo car il ne trouve pas d'id
        return null;
    }
}

module.exports = async (message) => {
    const url = await retreiveURL(message);
    if (!url) return;

    await message.channel.sendTyping();

    // Fetch json
    let cpt = 1;
    let j = ""
    while (cpt < 5) {
        await fetch(url)
            .then(async data => {
                // Obligé de try catch car des fois l'api renvoie un mauvais JSON
                try {
                    j = await data.json()
                    cpt = 10;
                } catch (e) {
                }
            });
    }

    if (cpt !== 10)
        await message.reply({content: "<@200227803189215232> Il est l'heure de changer de serveur !"});

    j = j["aweme_detail"];

    const embed = new MessageEmbed()
        .setColor('#EF2950')
        .setTitle(`Lien du TikTok`)
        .setURL(j["share_info"]["share_url"])
        .setAuthor({
            name: `${j["author"]["nickname"]} (@${j["author"]["unique_id"]})`,
            iconURL: j["author"]["avatar_168x168"]["url_list"][0],
            url: `https://www.tiktok.com/@${j["author"]["unique_id"]}`
        })
        .addField('Vues', j["statistics"]["play_count"].toString(), true)
        .addField('Likes', j["statistics"]["digg_count"].toString(), true)
        .addField('Commentaires', j["statistics"]["comment_count"].toString(), true)
        .setDescription(j["desc"])
        .setTimestamp(new Date(j["create_time"] * 1000))
        .setFooter({
            text: `Envoyé par ${message.member.user.username}`,
            iconURL: message.member.user.avatarURL({dynamic: true})
        });

    // Spoiler check
    const spoilerRegex = new RegExp(/([|]{2})/gi);
    const spoiler = message.content.match(spoilerRegex);

    if (spoiler)
        embed.setDescription("||" + j["description"] + "||")


    await download_video(message, j['video']['play_addr']['url_list'][0], embed, spoiler);
}
