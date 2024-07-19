const { MessageEmbed } = require('discord.js');

/**
 * Formats an event into a Discord Embed message.
 *
 * @param {Object} event - The event data to format.
 * @returns {MessageEmbed} The formatted Discord Embed message.
 */
module.exports = (event) => {
    const embed = new MessageEmbed()
        .setTitle(event.title)
        .setDescription(event.summary)
        .addField('Sport', event.sport.title, true)
        .addField('Medal Session', event.isMedalSession ? 'Yes' : 'No', true)
        .addField('Start Time', `<t:${Math.floor(new Date(event.startDate).getTime() / 1000)}:t>`, true)
        .addField('End Time', `<t:${Math.floor(new Date(event.endDate).getTime() / 1000)}:t>`, true)
        .setURL(event.videoURL)
        .setColor('#0099ff')
        .setFooter('Event ID: ' + event.eventId);

    return embed;
};