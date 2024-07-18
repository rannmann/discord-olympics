const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Event handlers
const readyHandler = require('./events/ready');
const interactionCreateHandler = require('./events/interactionCreate');

client.once('ready', readyHandler);
client.on('interactionCreate', interactionCreateHandler);

client.login(process.env.DISCORD_TOKEN);
