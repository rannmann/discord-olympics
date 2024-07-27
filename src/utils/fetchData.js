const axios = require('axios');
const fs = require('fs');
const parseEventData = require('./parseEventData');
const path = require('path');
const DailySchedule = require('../models/DailySchedule');
const CountryMedals = require('../models/CountryMedals');
const knex = require('knex')(require('../../knexfile').development);

const SPORT_FRONTPAGE = 'https://www.nbcolympics.com/api/sport_front?sort=title&filter%5Bstatus%5D=1&include=sport&include=sport';
const HIGH_LEVEL_SCHEDULE = 'https://www.nbcolympics.com/api/high_level_schedule?include=sport&sort=drupal_internal__id';

module.exports.getScheduleData = async (url) => {
    return await getScheduleData(url);
};


/**
 * Fetches the schedule data for a specific sport on a given date.
 *
 * @param {string} sport - The sport for which to fetch the schedule.
 * @param {string} date - The date for which to fetch the schedule in YYYY-MM-DD format.
 * @returns {Promise<Object[]>} A promise that resolves to an array of schedule data objects.
 */
module.exports.getScheduleForSportOnDate = async (sport, date) => {
    console.log(`Fetching schedule for ${sport} on ${date}...`);
    const url = `https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=${date}&endDate=${date}&filterType=sports&filterValue=${sport}&inPattern=true`;
    return await getScheduleData(url);
};


/**
 * 
 * @param {string} sport 
 * @param {string} date 
 * @returns {array}
 */
module.exports.getRawScheduleForSportOnDate = async (sport, date) => {
    console.log(`Fetching schedule for ${sport} on ${date}...`);
    const url = `https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=${date}&endDate=${date}&filterType=sports&filterValue=${sport}&inPattern=true`;
    const { data } = await axios.get(url);
    return data.data;
};

/**
 * Fetches the schedule data for a specific sport over a range of dates.
 *
 * @param {string} sport - The sport for which to fetch the schedule.
 * @param {string} startDate - The start date for the range in YYYY-MM-DD format.
 * @param {string} endDate - The end date for the range in YYYY-MM-DD format.
 * @returns 
 */
module.exports.getRawScheduleForSportOnDateRange = async (sport, startDate, endDate) => {
    console.log(`Fetching schedule for ${sport} on ${startDate} to ${endDate}...`);
    const url = `https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=${startDate}&endDate=${endDate}&filterType=sports&filterValue=${sport}&inPattern=true`;
    const { data } = await axios.get(url);
    return data.data;
};


/**
 * Retrieves the URL IDs for the summer games from the cached high-level schedule data.
 *
 * @returns {string[]} An array of URL IDs for the summer games.
 */
async function getSummerGamesUrlIds() {
    // Machine name and url id are identical.
    const sports = await knex('sports').where('games_league', 'summer').select('machine_name');
    return sports.map(sport => sport.machine_name);
};


/**
 * Fetches the schedule data for all summer games on a given date.
 *
 * @param {string} [testDate] - Optional test date in YYYY-MM-DD format. If not provided, the current date will be used.
 * @returns {Promise<DailySchedule>} A promise that resolves to a DailySchedule object where each key is a sport name and the value is an array of events for that sport on the given day.
 */
module.exports.getAllSummerGamesSchedules = async (testDate) => {
    const urlIds = await getSummerGamesUrlIds();
    const date = testDate || new Date().toISOString().split('T')[0];
    const schedule = new DailySchedule(date);

    for (const urlId of urlIds) {
        const events = await module.exports.getScheduleForSportOnDate(urlId, date);
        events.forEach(event => {
            schedule.addEvent(event.sport.title, event);
        });
    }

    return schedule;
};

/**
 * Fetches and parses the medal table data.
 *
 * @param {string} season - The season year to fetch the medal table data for.  Use 2021 for testing.
 * @returns {Promise<CountryMedals[]>} A promise that resolves to an array of MedalTableEntry objects.
 */
module.exports.getMedalTableData = async (season = '2024') => {
    const url = `https://api-gracenote.nbcolympics.com/svc/games_v2.svc/json/GetMedalTable_Season?competitionSetId=1&season=${season}&languageCode=2`;
    try {
        const { data } = await axios.get(url);
        if (data && data.MedalTableNOC && data.MedalTableNOC.length > 0) {
            return data.MedalTableNOC.map(entry => new CountryMedals(
                entry.c_NOC,
                entry.c_NOCShort,
                entry.n_Total,
                entry.n_Gold,
                entry.n_Silver,
                entry.n_Bronze
            ));
        } else {
            console.log('Invalid data format:', data);
            return [];
        }
    } catch (error) {
        console.log('Error fetching data:', error);
        return [];
    }
};

async function getScheduleData(url)
{
    try {
        const { data } = await axios.get(url);

        if (data && data.data) {
            const parsedResults = data.data.map(entry => parseEventData(entry));
            return parsedResults;
        } else {
            console.log('Invalid data format:', data);
            return null;
        }
    } catch (error) {
        console.log('Error fetching data:', error);
    }
}

module.exports.getSportsData = async () => {
    const url = 'https://images.nbcolympics.com/static/json/sports-filters.json';

    const { data } = await axios.get(url);

    const sports = data.filter(item => item.entityType === 'olympicSport');

    const uniqueSports = sports.reduce((acc, sport) => {
        if (!acc.some(s => s.drupalId === sport.drupalId)) {
            acc.push({
                id: sport.drupalId,
                name: sport.title,
                machine_name: sport.machineName,
                games_league: sport.gameType,
                active: true // Assuming all sports from this endpoint are active
            });
        }
        return acc;
    }, []);

    for (const sport of uniqueSports) {
        await knex('sports').insert(sport).onConflict('machine_name').ignore();

        // Insert subSports if they exist
        if (sport.subSports && sport.subSports.length > 0) {
            for (const subSport of sport.subSports) {
                await knex('sub_sports').insert({
                    id: subSport.drupalId,
                    name: subSport.title,
                    machine_name: subSport.machineName,
                    parent_sport_id: sport.drupalId,
                    active: true // Assuming all subSports from this endpoint are active
                }).onConflict('machine_name').ignore();
            }
        }
    }

    console.log('Sports and subSports inserted successfully');
};