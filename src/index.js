const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Event handlers
const readyHandler = require('./events/ready');
const messageCreateHandler = require('./events/messageCreate');

client.once('ready', readyHandler);
client.on('messageCreate', messageCreateHandler);

client.login(process.env.DISCORD_TOKEN);
