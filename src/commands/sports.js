const fetchOlympicsData = require('../utils/fetchData');
const { ApplicationCommandOptionType } = require('discord.js');
const knex = require('knex')(require('../../knexfile').development);

module.exports = {
    name: 'sports',
    description: 'Get all sports being played on a given date',
    options: [
        {
            name: 'date',
            type: ApplicationCommandOptionType.String,
            description: 'The date in YYYY-MM-DD format. Defaults to today.',
            required: false
        }
    ],
    async execute(interaction) {
        const date = interaction.options.getString('date') ?? new Date().toISOString().split('T')[0];
        const startOfDay = new Date(date).setHours(0, 0, 0) / 1000; // Convert to seconds
        const endOfDay = new Date(date).setHours(23, 59, 59) / 1000; // Convert to seconds
        
        // Fetch sports list from the database
        const sportsList = await knex('sports')
            .where('games_league', 'summer')
            .select('name', 'machine_name');

        if (sportsList.length === 0) {
            await interaction.reply({ content: `No sports found.`, ephemeral: true });
            return;
        }

        // Build the query for events
        const eventsQuery = knex('events')
            .join('event_sports', 'events.id', 'event_sports.event_id')
            .join('sports', 'event_sports.sport_id', 'sports.id')
            .where('events.start_date', '<=', endOfDay)
            .andWhere('events.end_date', '>=', startOfDay)
            .select('events.title', 'events.status', 'events.start_date', 'events.end_date', 'sports.name as sport_name');

        // Log the SQL query and bindings
        console.log(eventsQuery.toSQL().toNative());

        // Execute the query
        const events = await eventsQuery;

        if (events.length === 0) {
            await interaction.reply({ content: `No events found for the given date.`, ephemeral: true });
            return;
        }

        // Format the events list into a message
        const formattedEvents = events.map(event => {
            return `**${event.title}** (${event.sport_name})\nStatus: ${event.status}\nStart: <t:${Math.floor(event.start_date)}:F>\nEnd: <t:${Math.floor(event.end_date)}:t>\n`;
        }).join('\n');

        const messageTitle = `Events for ${date}:\n\n`;

        await interaction.reply({ content: messageTitle + formattedEvents, ephemeral: true });
    }
};