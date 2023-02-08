const responsesList = [
    "#NICK :man_police_officer:",
    "Faut penser à aller se faire foutre au bout d'un moment :middle_finger:",
    "A plus dans le bus NICK :wave:",
    ":skull_crossbones: <= Les gifs de NICK",
    "Comme ça c'est tout de suite mieux :ok_hand:",
];

module.exports = async (message) => {
    if (!message.content.includes("https://tenor.com/view/")) return;

    await message.delete();

    const nick = message.member.nickname ? message.member.nickname : message.author.username;
    const response = responsesList[Math.floor(Math.random() * responsesList.length)].replace("NICK", nick);

    await message.channel.send({ content: response });
};
