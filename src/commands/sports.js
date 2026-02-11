const { getScheduleOverview } = require('../utils/fetchData');
const { formatScheduleOverview } = require('../utils/messageFormatter');

module.exports = {
    name: 'sports',
    description: 'Get the list of Winter Olympics 2026 sports',
    options: [],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const sports = await getScheduleOverview();
            if (sports.length === 0) {
                await interaction.editReply('No schedule data available.');
                return;
            }
            const embed = formatScheduleOverview(sports);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error fetching the sports schedule.');
        }
    }
};
