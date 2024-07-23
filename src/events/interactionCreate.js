module.exports = async (interaction) => {
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

    if (interaction.isCommand()) {
        const command = require(`../commands/${interaction.commandName}`);
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    } else if (interaction.isAutocomplete()) {
        const command = require(`../commands/${interaction.commandName}`);
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
    }
};
