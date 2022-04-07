const fs = require('fs');
const {Client, Collection, Intents} = require('discord.js');
const {token} = require('./config.json');
const sqlite3 = require('sqlite3').verbose();
const cron = require('cron');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER']
});

// Commands handler
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Event Handler
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// open the database
const db = new sqlite3.Database('atrium.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connecté à la base de données.');
});

global.DB = db;
global.CLIENT = client;

// db.run('CREATE TABLE deleted(id integer primary key autoincrement, message text, date datetime)');


client.login(token).then(async () => {
    const cronJob = cron.job('0,30 17 * * 1-5', async () => {
        const channel = await client.channels.cache.get('667053408636633088');
        await channel.send({content: "Finito la journée", files: ['./resources/travail_termine.mp4']});
    });
    client.user.setActivity("des canettes", { type: "STREAMING", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" })

    cronJob.start();
});
