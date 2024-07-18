const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { clientId, guildId, token } = process.env;

const scheduleDailyAnnouncement = require('../schedules/dailyAnnouncement');
const scheduleLiveFeed = require('../schedules/liveFeed');

const commands = [
    {
        name: 'medals',
        description: 'Get the current Olympic medal count'
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

        scheduleDailyAnnouncement();
        scheduleLiveFeed();
    } catch (error) {
        console.error(error);
    }
};
