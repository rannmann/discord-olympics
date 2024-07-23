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
        if (data && data.MedalTableNOC) {
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

/**
 * Fetches sports data from the SPORT_FRONTPAGE URL.
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of sports data objects.
 */
module.exports.getSportsData = async () => {
    try {
        const { data } = await axios.get(SPORT_FRONTPAGE);
        if (data && data.data) {
            return data.data.map(entry => {
                return {
                    name: entry.attributes.title,
                    machine_name: entry.attributes.machine_name,
                    games_league: entry.attributes.games_league,
                    active: entry.attributes.status,
                    created_at: new Date(),
                    updated_at: new Date()
                };
            }).filter(entry => entry !== null); // Filter out null entries
        } else {
            console.log('Invalid data format:', data);
            return [];
        }
    } catch (error) {
        console.log('Error fetching data:', error);
        return [];
    }
};