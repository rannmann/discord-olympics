const { EmbedBuilder } = require('@discordjs/builders');
const DailySchedule = require('../models/DailySchedule');
const iso = require('iso-3166-1');

// Custom mapping for problematic country codes
const customCountryMapping = {
    'NED': 'NL',  // Netherlands
    'GER': 'DE',  // Germany
    'ROC': 'RU'   // Russian Olympic Committee (mapped to Russia)
};

/**
 * Formats an event into a Discord Embed message.
 *
 * @param {Object} event - The event data to format.
 * @returns {EmbedBuilder} The formatted Discord Embed message.
 */
module.exports = (event) => {
    const embed = new EmbedBuilder()
        .setTitle(event.title)
        .setDescription(event.summary)
        .addFields({ name: 'Sport', value: event.sport.title, inline: true })
        .addFields({ name: 'Medal Session', value: event.isMedalSession ? 'Yes' : 'No', inline: true })
        .addFields({ name: 'Start Time', value: `<t:${Math.floor(new Date(event.startDate).getTime() / 1000)}:t>`, inline: true })
        .addFields({ name: 'End Time', value: `<t:${Math.floor(new Date(event.endDate).getTime() / 1000)}:t>`, inline: true })
        .setURL(event.videoURL)
        .setColor('#0099ff')
        .setFooter({ text: 'Event ID: ' + event.eventId });

    return embed;
};

/**
 * Formats a list of sports and their event counts into a Discord Embed message.
 *
 * @param {DailySchedule} schedule - The schedule data with sports as keys and events as values.
 * @returns {EmbedBuilder} The formatted Discord Embed message.
 */
module.exports.formatSportsForDay = (schedule) => {
    console.log(schedule);
    const embed = new EmbedBuilder()
        .setTitle(`Sports Schedule for ${schedule.date}`)
        .setColor('#0099ff');

    let hasEvents = false;
    let description = '';

    if (schedule) {
        const sportsList = Object.entries(schedule.sports)
            .filter(([_, events]) => events.length > 0)
            .sort(([sportA], [sportB]) => sportA.localeCompare(sportB))
            .map(([sport, events]) => `**${sport}**: ${events.length} events`);

        if (sportsList.length > 0) {
            hasEvents = true;
            description = sportsList.join('\n');
        }
    }

    if (!hasEvents) {
        description = 'No events scheduled for today.';
    }

    embed.setDescription(description);

    return embed;
};

/**
 * Formats the medal table data into a Discord Embed message.
 *
 * @param {CountryMedals[]} medalTable - The medal table data to format.
 * @returns {EmbedBuilder} The formatted Discord Embed message.
 */
module.exports.formatMedalTable = (medalTable) => {
    // Limit the medal table to the top 10 countries
    const top10MedalTable = medalTable.slice(0, 10);

    let description = '';
    top10MedalTable.forEach(entry => {
        let countryCode = customCountryMapping[entry.countryCode];
        if (!countryCode) {
            const country = iso.whereAlpha3(entry.countryCode);
            if (!country) {
                console.error(`Country code ${entry.countryCode} not found`);
            }
            countryCode = country ? country.alpha2 : 'white';
        }
        description += `:flag_${countryCode.toLowerCase()}: **${entry.country}** - Total: ${entry.total}, :first_place: ${entry.gold}, :second_place: ${entry.silver}, :third_place: ${entry.bronze}\n`;
    });

    return new EmbedBuilder()
        .setTitle('Olympic Medal Count')
        .setDescription(description)
        .setColor(0x00AE86);
};