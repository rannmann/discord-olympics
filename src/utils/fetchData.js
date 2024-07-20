const axios = require('axios');
const fs = require('fs');
const parseEventData = require('./parseEventData');
const path = require('path');
const DailySchedule = require('../models/DailySchedule');

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
module.exports.getSummerGamesUrlIds = () => {
    const filePath = path.join(__dirname, '../../mocks/high_level_schedule.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const included = data.included || [];
    return included
        .filter(item => item.attributes.games_league === 'summer')
        .map(item => item.attributes.url_id);
};


/**
 * Fetches the schedule data for all summer games on a given date.
 *
 * @param {string} [testDate] - Optional test date in YYYY-MM-DD format. If not provided, the current date will be used.
 * @returns {Promise<DailySchedule>} A promise that resolves to a DailySchedule object where each key is a sport name and the value is an array of events for that sport on the given day.
 */
module.exports.getAllSummerGamesSchedules = async (testDate) => {
    const urlIds = module.exports.getSummerGamesUrlIds();
    const date = testDate || new Date().toISOString().split('T')[0];
    const schedule = new DailySchedule();

    for (const urlId of urlIds) {
        const events = await module.exports.getScheduleForSportOnDate(urlId, date);
        events.forEach(event => {
            schedule.addEvent(event.sport.title, event);
        });
    }

    return schedule;
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