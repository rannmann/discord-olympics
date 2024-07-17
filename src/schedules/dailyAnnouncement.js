const schedule = require('node-schedule');
const fetchOlympicsData = require('../utils/fetchData');
const { urls, announcementTime } = require('../config');

module.exports = () => {
    schedule.scheduleJob(announcementTime, async () => {
        const events = await fetchOlympicsData(urls.scheduleUrl);
        // Format and send the message here
    });
};
