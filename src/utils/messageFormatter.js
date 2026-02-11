const { EmbedBuilder } = require('discord.js');
const iso = require('iso-3166-1');

// Map IOC codes to ISO 2-letter codes for Discord flag emoji
const iocToIso = {
    'NOR': 'NO', 'SUI': 'CH', 'USA': 'US', 'GER': 'DE', 'SWE': 'SE',
    'AUT': 'AT', 'FRA': 'FR', 'ITA': 'IT', 'JPN': 'JP', 'CZE': 'CZ',
    'NED': 'NL', 'SLO': 'SI', 'CAN': 'CA', 'CHN': 'CN', 'NZL': 'NZ',
    'KOR': 'KR', 'AUS': 'AU', 'FIN': 'FI', 'GBR': 'GB', 'ESP': 'ES',
    'POL': 'PL', 'BEL': 'BE', 'BRA': 'BR', 'ROC': 'RU', 'UKR': 'UA',
    'EST': 'EE', 'LAT': 'LV', 'LTU': 'LT', 'SVK': 'SK', 'CRO': 'HR',
    'HUN': 'HU', 'ROU': 'RO', 'BUL': 'BG', 'DEN': 'DK', 'KAZ': 'KZ',
    'BLR': 'BY', 'GEO': 'GE', 'ARM': 'AM', 'LIE': 'LI', 'ISL': 'IS',
    'IRL': 'IE', 'AND': 'AD', 'MON': 'MC', 'SMR': 'SM', 'LUX': 'LU',
    'MDA': 'MD', 'MNE': 'ME', 'MKD': 'MK', 'ALB': 'AL', 'BIH': 'BA',
    'SRB': 'RS', 'TUR': 'TR',
};

// Map country names to ISO codes for flag emoji (Wikipedia fallback)
const countryNameToCode = {
    'Norway': 'NO', 'Switzerland': 'CH', 'United States': 'US',
    'Germany': 'DE', 'Sweden': 'SE', 'Austria': 'AT', 'France': 'FR',
    'Italy': 'IT', 'Japan': 'JP', 'Czech Republic': 'CZ',
    'Netherlands': 'NL', 'Slovenia': 'SI', 'Canada': 'CA',
    'China': 'CN', 'New Zealand': 'NZ', 'South Korea': 'KR',
    'Australia': 'AU', 'Finland': 'FI', 'Great Britain': 'GB',
    'Spain': 'ES', 'Poland': 'PL', 'Belgium': 'BE', 'Brazil': 'BR',
    'ROC': 'RU', 'Russia': 'RU', 'Ukraine': 'UA', 'Estonia': 'EE',
    'Latvia': 'LV', 'Lithuania': 'LT', 'Slovakia': 'SK',
    'Croatia': 'HR', 'Hungary': 'HU', 'Romania': 'RO',
    'Bulgaria': 'BG', 'Denmark': 'DK', 'Kazakhstan': 'KZ',
    'Belarus': 'BY', 'Georgia': 'GE', 'Armenia': 'AM',
    'Liechtenstein': 'LI', 'Iceland': 'IS', 'Ireland': 'IE',
    'Andorra': 'AD', 'Monaco': 'MC', 'San Marino': 'SM',
    'Luxembourg': 'LU', 'Moldova': 'MD', 'Montenegro': 'ME',
    'North Macedonia': 'MK', 'Albania': 'AL', 'Bosnia and Herzegovina': 'BA',
    'Serbia': 'RS', 'Türkiye': 'TR', 'Turkey': 'TR',
};

function getFlag(countryName, countryCode) {
    // Try IOC code first (from NBC API)
    if (countryCode && iocToIso[countryCode]) {
        return `:flag_${iocToIso[countryCode].toLowerCase()}:`;
    }
    // Fall back to country name lookup (Wikipedia)
    const code = countryNameToCode[countryName];
    if (code) {
        return `:flag_${code.toLowerCase()}:`;
    }
    return '🏳️';
}

/**
 * Formats the medal table into a Discord Embed.
 */
module.exports.formatMedalTable = (medalTable, limit = 15) => {
    const top = medalTable.slice(0, limit);

    let description = '';
    top.forEach((entry, i) => {
        const flag = getFlag(entry.country, entry.countryCode);
        const rank = entry.rank || (i + 1);
        description += `**${rank}.** ${flag} **${entry.country}** — 🥇 ${entry.gold}  🥈 ${entry.silver}  🥉 ${entry.bronze}  Total: ${entry.total}\n`;
    });

    return new EmbedBuilder()
        .setTitle('🏅 Winter Olympics 2026 — Medal Count')
        .setDescription(description || 'No medal data available yet.')
        .setColor(0x1E90FF)
        .setFooter({ text: 'Data from Wikipedia • Milano Cortina 2026' })
        .setTimestamp();
};

/**
 * Formats recent medal results into a Discord Embed.
 */
module.exports.formatMedalResults = (events, limit = 10) => {
    const recent = events.slice(0, limit);
    let description = '';

    for (const evt of recent) {
        description += `**${evt.discipline} — ${evt.event}**\n`;
        for (const [type, winner] of Object.entries(evt.medals)) {
            const emoji = { gold: '🥇', silver: '🥈', bronze: '🥉' }[type] || '🏅';
            const flag = getFlag(winner.country, winner.countryCode);
            description += `${emoji} ${winner.athlete} ${flag}\n`;
        }
        description += '\n';
    }

    return new EmbedBuilder()
        .setTitle('🏅 Winter Olympics 2026 — Recent Medals')
        .setDescription(description || 'No medal results available yet.')
        .setColor(0xFFD700)
        .setFooter({ text: 'Data from NBC Olympics • Milano Cortina 2026' })
        .setTimestamp();
};

/**
 * Formats the schedule overview into a Discord Embed.
 */
module.exports.formatScheduleOverview = (sports) => {
    let description = '';
    sports.forEach(sport => {
        const medal = sport.totalMedalEvents > 0 ? `🏅 ${sport.totalMedalEvents} medal events` : '⏳ Competition only';
        description += `**${sport.name}** — ${medal}\n`;
    });

    return new EmbedBuilder()
        .setTitle('🏔️ Winter Olympics 2026 — Sports')
        .setDescription(description || 'No schedule data available.')
        .setColor(0x1E90FF)
        .setFooter({ text: 'Milano Cortina 2026 • Feb 6-22' })
        .setTimestamp();
};
