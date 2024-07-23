const messageFormatter = require('../utils/messageFormatter');
const fetchOlympicsData = require('../utils/fetchData');
const { ApplicationCommandOptionType } = require('discord.js');
const knex = require('knex')(require('../../knexfile').development);

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
            required: true,
            autocomplete: true // Enable autocomplete for dynamic options
        }
    ],
    async execute(interaction) {
        const date = interaction.options.getString('date');
        const sportName = interaction.options.getString('sport');
        
        // Fetch sports list from the database
        const sportsList = await knex('sports').where('games_league', 'summer').select('name', 'machine_name');
        const sport = sportsList.find(s => s.name.toLowerCase() === sportName.toLowerCase());

        if (!sport) {
            await interaction.reply({ content: `Sport ${sportName} not found.`, ephemeral: true });
            return;
        }

        const schedule = await fetchOlympicsData.getAllSummerGamesSchedules(date);
        const events = schedule.getEventsBySport(sport.machine_name);

        if (events.length === 0) {
            await interaction.reply({ content: `No events found for ${sport.name} on ${date}.`, ephemeral: true });
        } else {
            const formattedMessage = messageFormatter.formatEventsForSport(events);
            await interaction.reply({ embeds: [formattedMessage], ephemeral: true });
        }
    },
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        console.log('Autocomplete interaction received:', focusedOption);
        if (focusedOption.name === 'sport') {
            // Fetch sports list from the database
            const sportsList = await knex('sports').where('games_league', 'summer').select('name');
            const choices = sportsList.map(sport => sport.name);
            const filtered = choices.filter(choice => choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()));
            await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
        }
    }
};