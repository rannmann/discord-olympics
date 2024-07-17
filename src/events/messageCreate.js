const fetchOlympicsData = require('../utils/fetchData');
const { urls } = require('../config');

module.exports = async (message) => {
    if (message.content.startsWith('!medals')) {
        const medals = await fetchOlympicsData(urls.medalCountUrl);
        message.author.send(`Medal count: ${medals}`);
    }
};
