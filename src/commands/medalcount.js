const { getMedalTableData } = require('../utils/fetchData');
const { formatMedalTable } = require('../utils/messageFormatter');

module.exports = {
    name: 'medalcount',
    description: 'Get the current Winter Olympics 2026 medal count',
    options: [],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const medalTable = await getMedalTableData();
            if (medalTable.length === 0) {
                await interaction.editReply('No medal data available yet.');
                return;
            }
            const embed = formatMedalTable(medalTable);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error fetching the medal table data.');
        }
    }
};
