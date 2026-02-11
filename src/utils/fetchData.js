const axios = require('axios');
const config = require('../config');

const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_HEADERS = {
    'User-Agent': 'DiscordOlympicsBot/2.0 (https://github.com/rannmann/discord-olympics)'
};

const NBC_API = 'https://mic-nbc-app.ovpobs.tv/api';
const NBC_TOKEN = process.env.NBC_APP_TOKEN;

function nbcHeaders() {
    return {
        'x-obs-app-token': NBC_TOKEN,
        'accept': 'application/vnd.api+json',
        'Referer': 'https://www.nbcolympics.com/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
    };
}

/**
 * Fetches medal table data.  Tries NBC API first, falls back to Wikipedia.
 * Returns array of { rank, country, countryCode, gold, silver, bronze, total }
 */
module.exports.getMedalTableData = async () => {
    if (NBC_TOKEN) {
        try {
            return await getMedalTableFromNBC();
        } catch (error) {
            console.error('NBC API failed, falling back to Wikipedia:', error.message);
        }
    }
    return await getMedalTableFromWikipedia();
};

/**
 * Fetches schedule overview from Wikipedia.
 */
module.exports.getScheduleOverview = async () => {
    try {
        const { data } = await axios.get(WIKI_API, {
            headers: WIKI_HEADERS,
            params: {
                action: 'parse',
                page: config.wikipedia.schedule,
                section: config.wikipedia.scheduleSection,
                prop: 'text',
                format: 'json'
            }
        });
        return parseSchedule(data.parse.text['*']);
    } catch (error) {
        console.error('Error fetching schedule:', error.message);
        return [];
    }
};

// ─── NBC API ────────────────────────────────────────────────────────────────

async function getMedalTableFromNBC() {
    const filter = JSON.stringify([{ name: 'total', op: 'notin', val: ['0'] }]);
    const { data } = await axios.get(`${NBC_API}/medal-counts`, {
        headers: nbcHeaders(),
        params: {
            'include': 'organisation',
            'filter': filter,
            'page[size]': 99,
            'sort': '-gold,-total'
        }
    });

    // Build org lookup from included
    const orgs = {};
    for (const item of (data.included || [])) {
        if (item.type === 'Organisation') {
            orgs[item.id] = item.attributes;
        }
    }

    // NBC returns per-discipline medal counts, so we aggregate by country
    // The org's own statistics field has the aggregate, so use that instead
    const results = [];
    const seen = new Set();

    for (const item of (data.included || [])) {
        if (item.type === 'Organisation' && item.attributes.statistics && !seen.has(item.id)) {
            seen.add(item.id);
            const stats = item.attributes.statistics;
            if (stats.total > 0) {
                results.push({
                    rank: stats.goldRank || 0,
                    country: item.attributes.name || 'Unknown',
                    countryCode: item.attributes.externalId || '??',
                    gold: stats.gold || 0,
                    silver: stats.silver || 0,
                    bronze: stats.bronze || 0,
                    total: stats.total || 0
                });
            }
        }
    }

    // Sort by gold desc, then silver, then bronze
    results.sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze);

    // Assign proper ranks (handling ties)
    let rank = 1;
    for (let i = 0; i < results.length; i++) {
        if (i > 0 && results[i].gold === results[i-1].gold && results[i].silver === results[i-1].silver && results[i].bronze === results[i-1].bronze) {
            results[i].rank = results[i-1].rank;
        } else {
            results[i].rank = rank;
        }
        rank = i + 2;
    }

    console.log(`NBC API: ${results.length} countries loaded`);
    return results;
}

/**
 * Fetches recent medal results with athlete names, events, and disciplines.
 * NBC API only (no Wikipedia fallback for this).
 */
module.exports.getMedalResults = async () => {
    if (!NBC_TOKEN) {
        return [];
    }

    try {
        const { data } = await axios.get(`${NBC_API}/medals`, {
            headers: nbcHeaders(),
            params: {
                'fields[Medal]': 'medalType,event,participant,organisation',
                'fields[Event]': 'name,discipline',
                'fields[Discipline]': 'name',
                'fields[Organisation]': 'name,externalId',
                'fields[Participant]': 'name,participantType',
                'include': 'event.discipline,organisation,participant',
                'page[size]': 99,
                'sort': '-publishedAt'
            }
        });

        const inc = {};
        for (const item of (data.included || [])) {
            inc[item.id] = item;
        }

        // Group medals by event
        const events = new Map();
        for (const medal of data.data) {
            const a = medal.attributes;
            const rels = medal.relationships || {};

            const eventId = rels.event?.data?.id || '';
            const orgId = rels.organisation?.data?.id || '';
            const partId = rels.participant?.data?.id || '';

            const event = inc[eventId]?.attributes || {};
            const org = inc[orgId]?.attributes || {};
            const part = inc[partId]?.attributes || {};

            const discId = inc[eventId]?.relationships?.discipline?.data?.id || '';
            const disc = inc[discId]?.attributes || {};

            const medalType = (a.medalType || '').replace('ME_', '').toLowerCase();

            if (!events.has(eventId)) {
                events.set(eventId, {
                    discipline: disc.name || '?',
                    event: event.name || '?',
                    medals: {}
                });
            }

            events.get(eventId).medals[medalType] = {
                athlete: part.name || '?',
                country: org.name || '?',
                countryCode: org.externalId || '??'
            };
        }

        return Array.from(events.values());
    } catch (error) {
        console.error('Error fetching medal results:', error.message);
        return [];
    }
};

// ─── Wikipedia Fallback ─────────────────────────────────────────────────────

async function getMedalTableFromWikipedia() {
    const { data } = await axios.get(WIKI_API, {
        headers: WIKI_HEADERS,
        params: {
            action: 'parse',
            page: config.wikipedia.medalTable,
            prop: 'text',
            format: 'json'
        }
    });
    return parseMedalTable(data.parse.text['*']);
}

function parseMedalTable(html) {
    const results = [];
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
        const row = match[1];
        const cells = [];
        const cellRegex = /<t[hd][^>]*>(.*?)<\/t[hd]>/gs;
        let cellMatch;

        while ((cellMatch = cellRegex.exec(row)) !== null) {
            let text = cellMatch[1]
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&#160;/g, ' ')
                .replace(/\*$/, '')
                .trim();
            cells.push(text);
        }

        if (cells.length >= 5) {
            const hasRank = /^\d+$/.test(cells[0]);
            const offset = hasRank ? 0 : -1;
            const country = cells[1 + offset];
            const gold = parseInt(cells[2 + offset]) || 0;
            const silver = parseInt(cells[3 + offset]) || 0;
            const bronze = parseInt(cells[4 + offset]) || 0;
            const total = parseInt(cells[5 + offset]) || (gold + silver + bronze);

            if (country && country !== 'NOC' && country !== 'Totals' && country !== 'Total' && country !== 'Rank' && !country.includes('Nation') && !country.includes('Totals (')) {
                results.push({
                    rank: hasRank ? parseInt(cells[0]) : (results.length > 0 ? results[results.length - 1].rank : 0),
                    country,
                    countryCode: '',
                    gold, silver, bronze, total
                });
            }
        }
    }

    console.log(`Wikipedia: ${results.length} countries loaded`);
    return results;
}

function parseSchedule(html) {
    const sports = [];
    const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gs;
    let match;

    const winterSports = [
        'Alpine skiing', 'Biathlon', 'Bobsleigh', 'Cross-country skiing',
        'Curling', 'Figure skating', 'Freestyle skiing', 'Ice hockey',
        'Luge', 'Nordic combined', 'Short-track speed skating', 'Skeleton',
        'Ski jumping', 'Ski mountaineering', 'Snowboarding', 'Speed skating'
    ];

    while ((match = rowRegex.exec(html)) !== null) {
        const row = match[1];
        const cells = [];
        const cellRegex = /<t[hd][^>]*>(.*?)<\/t[hd]>/gs;
        let cellMatch;

        while ((cellMatch = cellRegex.exec(row)) !== null) {
            let text = cellMatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ').trim();
            cells.push(text);
        }

        if (cells.length > 0) {
            const sportName = cells[0];
            if (winterSports.includes(sportName)) {
                const medalEvents = cells.slice(1).filter(c => /^\d+$/.test(c)).reduce((sum, c) => sum + parseInt(c), 0);
                const competitionDays = cells.slice(1).filter(c => c === '●' || /^\d+$/.test(c)).length;
                sports.push({ name: sportName, totalMedalEvents: medalEvents, competitionDays });
            }
        }
    }

    return sports;
}
