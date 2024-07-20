const { ApplicationCommandOptionType } = require('discord.js');
const { getMedalTableData } = require('../utils/fetchData');
const { formatMedalTable } = require('../utils/messageFormatter');

module.exports = {
    name: 'medalcount',
    description: 'Get the Olympic medal count for a specific season',
    options: [
        {
            name: 'season',
            type: ApplicationCommandOptionType.String, 
            description: 'The season year to fetch the medal table data for. Defaults to 2021.',
            required: false
        }
    ],
    async execute(interaction) {
        const season = interaction.options.getString('season') || '2021';
        await interaction.deferReply({ ephemeral: true });

        try {
            const medalTable = await getMedalTableData(season);
            const embed = formatMedalTable(medalTable);
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply('There was an error fetching the medal table data.');
        }
    }
};