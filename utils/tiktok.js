const {MessageEmbed} = require("discord.js");
const {v1: uuidv1} = require("uuid");
const download = require("download");
const fs = require("fs");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


module.exports = async (message) => {
    const args = message.content.split(" ");

    // Recup le lien
    let url = ""
    args.forEach((item) => {
        if (item.includes("http")) url = item;
    })

    const tmp = await fetch(url);
    const regexID = new RegExp(/\/([0-9]+)/i);
    let match = null;
    try {
        match = tmp.url.match(regexID)[1];
    } catch (e) {
        // C'est certainement un profil ou un lien sans vidéo car il ne trouve pas d'id
        return;
    }
    url = `https://api2.musical.ly/aweme/v1/aweme/detail/?aweme_id=${match}`;

    await message.channel.sendTyping();

    let cpt = 1;
    let j = ""
    while (cpt < 5) {
        await fetch(url)
            .catch(() => {
            })
            .then(async data => {
                // Obligé de try catch car des fois l'api renvoie un mauvais JSON
                try {
                    j = await data.json()
                    cpt = 10;
                } catch (e) {
                }
            });
    }

    if (j["aweme_detail"] === undefined)
        await message.reply({content: "Le lien semble incorrect..."});

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
    const folderPath = '/tmp/';
    const filename = `${uuidv1()}.mp4`;


    download(j['video']['play_addr']['url_list'][0], folderPath, {filename: filename})
        .then(async () => {
            await message.channel.send({embeds: [embed]});
            await message.channel.send({files: [`${folderPath}${filename}`]});
            await message.delete();
            fs.unlink(`${folderPath}${filename}`, (err) => {
                if (err) {
                    console.error(err)
                }
            })
        })
}
