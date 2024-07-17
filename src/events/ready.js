const scheduleDailyAnnouncement = require('../schedules/dailyAnnouncement');
const scheduleLiveFeed = require('../schedules/liveFeed');

module.exports = () => {
    console.log('Bot is online!');
    scheduleDailyAnnouncement();
    scheduleLiveFeed();
};
