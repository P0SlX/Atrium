const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const { token, host, user, password, database } = require('./config.json');
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql');
const pino = require("pino");
const logger = pino(pino.destination({ dest: '/tmp/log.json', sync: false }));
const { GatewayIntentBits } = require('discord.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
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
    }
    else {
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

const con = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
});

con.connect(function(err) {
    if (err) {
        logger.error(err);
        console.error(err);
        return;
    }
    console.log("Connecté à la base de données MySQL.")
});

global.DB = db;
global.con = con;
global.CLIENT = client;
global.LOGGER = logger;

// db.run('CREATE TABLE deleted(id integer primary key autoincrement, message text, date datetime)');

client.login(token);
