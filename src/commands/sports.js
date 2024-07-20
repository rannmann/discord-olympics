const { SlashCommandBuilder } = require('@discordjs/builders');
const { getAllSummerGamesSchedules } = require('../utils/fetchData');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sports')
        .setDescription('Get the list of sports being played on a specific date')
        .addStringOption(option =>
            option.setName('date')
                .setDescription('The date in YYYY-MM-DD format')
                .setRequired(true)),
    async execute(interaction) {
        const date = interaction.options.getString('date');
        const schedule = await getAllSummerGamesSchedules(date);
        const sports = Object.keys(schedule.events);
        await interaction.reply(`Sports on ${date}: ${sports.join(', ')}`);
    },
};
