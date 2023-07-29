const extract_url = require("./extract_url");

module.exports = async (message) => {
    let url = await extract_url(message);

    // Transfort url from this : https://twitter.com/[...]
    // To this : https://vxtwitter.com/[...]
    // and send url back to channel

    url = url.replace("twitter.com", "vxtwitter.com");
    await message.channel.send({ content: url });

    await message.delete().catch((err) => {
        console.error(err);
    });
};
