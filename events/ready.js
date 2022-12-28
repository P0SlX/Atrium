const cron = require("cron");
const { ActivityType } = require("discord-api-types/v10");

const daysUntilChristmas = () => Math.ceil((new Date(new Date().getFullYear() + (new Date() > new Date(new Date().getFullYear(), 11, 25) ? 1 : 0), 11, 25) - new Date()) / (1000 * 60 * 60 * 24));

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`Connecté en tant que ${client.user.tag}`);
        global.LOGGER.info(`Connecté en tant que ${client.user.tag}`);

        const cronJob = cron.job('0 10 * * *', async () => {
            const channel = await client.channels.cache.get('667053408636633088');
            const days = daysUntilChristmas();
            await channel.setTopic(`Il reste ${days} jours avant Noël !`);
            await channel.send({ content: `<@&667000409247711269> Il reste ${days} jours avant Noël !` });
        });
        client.user.setActivity("des canettes", {
            type: ActivityType.Streaming,
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        });

        cronJob.start();
    },
};
