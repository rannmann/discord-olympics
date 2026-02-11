const { getMedalResults } = require('../utils/fetchData');
const { formatMedalResults } = require('../utils/messageFormatter');

module.exports = {
    name: 'medals',
    description: 'Get recent Olympic medal winners',
    options: [],
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const medals = await getMedalResults();
            if (medals.length === 0) {
                await interaction.editReply('No medal results available yet.');
                return;
            }
            const embed = formatMedalResults(medals);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error fetching medal results.');
        }
    }
};
