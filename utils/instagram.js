const { EmbedBuilder } = require("discord.js");
const download_video = require("./download_video");
const { get, post } = require("./https");
const extract_url = require("./extract_url");
const { instagram } = require('../config.json');
const fs = require("fs");
const axios = require("axios");

exports.login = async () => {
    let cookies;
    const login_url = 'https://i.instagram.com/api/v1/web/accounts/login/ajax/';
    const timestamp = Date.now();
    const payload = {
        username: instagram.username,
        enc_password: `#PWD_INSTAGRAM_BROWSER:0:${timestamp}:${instagram.password}`,
        queryParams: {},
        optIntoOneTap: 'false',
        trustedDeviceRecords: {},
    };
    const csrfPage = await axios.get('https://i.instagram.com/api/v1/web/data/shared_data/');
    cookies = csrfPage.headers['set-cookie'][0];
    const csrfToken = csrfPage.data['config']['csrf_token'];

    const postLogin = await axios.post(login_url, payload, {
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest",
            "referer": "https://www.instagram.com/",
            'x-csrftoken': csrfToken,
            'cookie': `csrftoken=${csrfToken}; ig_did=59E0C41A-0E81-4890-9829-2DCF28DCE64A; mid=Y2AIuQAEAAFMRL4z0TneMyLykE6d`,
        },
    });
    console.log(postLogin);
    const test = await axios.get('https://i.instagram.com/api/v1/media/2946854614360281422/info/');
    fs.writeFileSync('test.html', test.data);
    // const test = await get('https://i.instagram.com/api/v1/media/2946854614360281422/info/', postLogin.cookies);
    // console.log(test);
    return postLogin.cookies;
};

exports.fetch = async (message) => {
    const url = await extract_url(message);
    if (!url) return;

    const logger = global.LOGGER;
    const cookies = global.INSTA_COOKIES;

    await message.channel.sendTyping();

    const userAgent = "Instagram 219.0.0.12.117 Android";
    // Fetch webpage
    const { body: data } = await get(url, cookies, userAgent).catch((err) => {
        logger.error(err);
        console.error(err);
        message.reply({ content: "Erreur lors de la récupération des données" });
        return false;
    });
    // write body to file
    console.log(data);
    fs.writeFileSync('data.json', data);
    //
    // // Spoiler check
    // const spoiler = message.content.match(new RegExp(/([|]{2})/gi));
    // if (spoiler) description = "||" + description + "||";
    //
    // // Remove all hashtags from description
    // const hashtagsRegex = new RegExp(/(#\w+)/gi);
    // const hashtagsToDelete = description.match(hashtagsRegex);
    //
    // if (hashtagsToDelete !== null) {
    //     hashtagsToDelete.forEach((item) => {
    //         description = description.replace(item, "");
    //     });
    // }
    //
    // try {
    //     const embed = new EmbedBuilder()
    //         .setColor('#EF2950')
    //         .setTitle(`Lien du TikTok`)
    //         .setURL(url)
    //         .setAuthor({
    //             name: `${nickname} (@${authorUniqueId})`,
    //             iconURL: avatar,
    //             url: `https://www.tiktok.com/@${authorUniqueId}`,
    //         })
    //         .addFields(
    //             { name: "Vues", value: views.toString(), inline: true },
    //             { name: "Likes", value: likes.toString(), inline: true },
    //             { name: "Commentaires", value: comments.toString(), inline: true },
    //         )
    //         .setTimestamp(createdAt)
    //         .setFooter({
    //             text: `Envoyé par ${message.member.user.username}`,
    //             iconURL: message.member.user.avatarURL({ dynamic: true }),
    //         });
    //
    //     if (description.length > 0) {
    //         embed.setDescription(description);
    //     }
    //
    //     await download_video(message, videoUrl, embed, spoiler);
    // } catch (e) {
    //     logger.error(e);
    //     console.log(e);
    // }
};
