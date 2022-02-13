module.exports = async (message, filter) => {
    const args = message.content.split(" ");

    let url = ""
    args.forEach((item) => {
        if (item.includes(filter)) url = item;
    })

    if (url === "") {
        await message.channel.reply({
            content: "Impossible de récup l'URL de la vidéo...", allowedMentions: {repliedUser: false}
        });
        console.error('Erreur: URL Reddit impossible à recup.');
        return;
    }
    return url;
}
