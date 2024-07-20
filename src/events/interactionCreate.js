const { urls } = require('../config');
const fetchOlympicsData = require('../utils/fetchData');
const messageFormatter = require('../utils/messageFormatter');

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'medals') {
        await interaction.deferReply(); // Acknowledge the command
        //const medals = await fetchOlympicsData(urls.medalCountUrl);
        //await interaction.editReply(`Medal count: ${medals}`);
        await interaction.editReply('TODO');
    }

    if (commandName === 'sports') {
        await interaction.deferReply(); // Acknowledge the command
        const date = interaction.options.getString('date');
        const schedule = await fetchOlympicsData.getAllSummerGamesSchedules(date);
        const formattedMessage = messageFormatter.formatSportsForDay(schedule);
        await interaction.editReply({ embeds: [formattedMessage] });
    }
};
