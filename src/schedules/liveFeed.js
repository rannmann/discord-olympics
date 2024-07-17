const fetchOlympicsData = require('../utils/fetchData');
const { urls } = require('../config');

module.exports = () => {
    setInterval(async () => {
        const liveEvents = await fetchOlympicsData(urls.liveFeedUrl);
        // Logic to check and send message for new events
    }, 120000); // Check every 2 minutes
};
