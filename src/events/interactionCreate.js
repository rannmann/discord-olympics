const { urls } = require('../config');
const fetchOlympicsData = require('../utils/fetchData');
const messageFormatter = require('../utils/messageFormatter');
const medalCountCommand = require('../commands/medalcount');

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;


    if (commandName === 'sports') {
        await interaction.deferReply(); // Acknowledge the command
        const date = interaction.options.getString('date');
        const schedule = await fetchOlympicsData.getAllSummerGamesSchedules(date);
        const formattedMessage = messageFormatter.formatSportsForDay(schedule);
        await interaction.editReply({ embeds: [formattedMessage] });
    }

    if (commandName === 'medalcount') {
        await medalCountCommand.execute(interaction);
    }
};
