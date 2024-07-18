const { urls } = require('../config');
const fetchOlympicsData = require('../utils/fetchData');

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'medals') {
        const medals = await fetchOlympicsData(urls.medalCountUrl);
        await interaction.reply(`Medal count: ${medals}`);
    }
};
