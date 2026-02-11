require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Event handlers
const readyHandler = require('./events/ready');
const interactionCreateHandler = require('./events/interactionCreate');

client.once('ready', readyHandler);
client.on('interactionCreate', interactionCreateHandler);

console.log('Starting Olympics Bot...');
client.login(process.env.DISCORD_TOKEN);
