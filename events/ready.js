const cron = require("cron");

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Connecté en tant que ${client.user.tag}`);
        global.LOGGER.info(`Connecté en tant que ${client.user.tag}`);

        // const cronJob = cron.job('0,30 17 * * 1-5', async () => {
        // 	const channel = await client.channels.cache.get('667053408636633088');
        // 	await channel.send({ content: "Finito la journée", files: ['./resources/travail_termine.mp4'] });
        // });
        client.user.setActivity("des canettes", {
            type: "STREAMING",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        });

        // cronJob.start();
    },
};
