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
const db = new sqlite3.Database('prout.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connecté à la base de données.');
});

global.DB = db;
global.CLIENT = client;

// db.run('CREATE TABLE deleted(id integer primary key autoincrement, message text, date datetime)');


client.login(token).then(() => {
    const channel = client.channels.cache.get('853019023544549376');
    // channel.send({files: [`${folderPath}${filename}`]});
    const cronJob = cron.job('0 17 * * *', async () => {
        channel.send({content: "IL EST 17H !",files: ['./resources/travail_termine.mp4']});
    });

    cronJob.start();
});
