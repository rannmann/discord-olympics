const axios = require('axios');
const parseEventData = require('./parseEventData');

const SPORT_FRONTPAGE = 'https://www.nbcolympics.com/api/sport_front?sort=title&filter%5Bstatus%5D=1&include=sport&include=sport';
const HIGH_LEVEL_SCHEDULE = 'https://www.nbcolympics.com/api/high_level_schedule?include=sport&sort=drupal_internal__id';

module.exports.getScheduleData = async (url) => {
    return await getScheduleData(url);
};

module.exports.getScheduleForSportOnDate = async (sport, date) => {
    const url = `https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=${date}&endDate=${date}&filterType=sports&filterValue=${sport}&inPattern=true`;
    return await getScheduleData(url);
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