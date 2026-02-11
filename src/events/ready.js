const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ApplicationCommandOptionType } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const commands = [
    {
        name: 'medalcount',
        description: 'Get the current Winter Olympics 2026 medal count',
    },
    {
        name: 'medals',
        description: 'Get recent Winter Olympics 2026 medal winners',
    },
    {
        name: 'sports',
        description: 'Get the list of Winter Olympics 2026 sports',
    },
];

const rest = new REST({ version: '9' }).setToken(token);

module.exports = async (client) => {
    try {
        console.log('Bot is online!');

        if (guildId) {
            // Register to specific guild (instant, good for testing)
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );
            console.log(`Registered commands to guild ${guildId}`);
        } else {
            // Register globally (takes up to 1 hour to propagate)
            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands }
            );
            console.log('Registered global commands (may take up to 1 hour)');
        }
    } catch (error) {
        console.error('Error registering commands:', error);
    }
};
