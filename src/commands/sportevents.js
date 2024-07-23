const messageFormatter = require('../utils/messageFormatter');
const fetchOlympicsData = require('../utils/fetchData');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    name: 'sportevents',
    description: 'Get all events for a specific sport on a given date',
    options: [
        {
            name: 'date',
            type: ApplicationCommandOptionType.String,
            description: 'The date in YYYY-MM-DD format. Defaults to today.',
            required: false
        },
        {
            name: 'sport',
            type: ApplicationCommandOptionType.String,
            description: 'The name of the sport.',
            required: true
        }
    ],
    async execute(interaction) {
        const date = interaction.options.getString('date');
        const sport = interaction.options.getString('sport');
        const schedule = await fetchOlympicsData.getAllSummerGamesSchedules(date);
        const events = schedule.getEventsBySport(sport);

        if (events.length === 0) {
            await interaction.reply({ content: `No events found for ${sport} on ${date}.`, ephemeral: true });
        } else {
            const formattedMessage = messageFormatter.formatEventsForSport(events);
            await interaction.reply({ embeds: [formattedMessage], ephemeral: true });
        }
    }
};