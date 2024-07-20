const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ApplicationCommandOptionType } = require('discord.js');
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

const scheduleDailyAnnouncement = require('../schedules/dailyAnnouncement');
const scheduleLiveFeed = require('../schedules/liveFeed');

const commands = [
    {
        name: 'medals',
        description: 'Get the current Olympic medal count'
    },
    {
        name: 'sports',
        description: 'Get the list of sports being played on a specific date',
        options: [
            {
                name: 'date',
                type: ApplicationCommandOptionType.String,
                description: 'The date in YYYY-MM-DD format. Defaults to today.',
                required: false
            }
        ]
    }
];

const rest = new REST({ version: '9' }).setToken(token);

module.exports = async () => {
    try {
        console.log('Bot is online!');
        
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Successfully registered application commands.');

        //scheduleDailyAnnouncement();
        //scheduleLiveFeed();
    } catch (error) {
        console.error(error);
    }
};