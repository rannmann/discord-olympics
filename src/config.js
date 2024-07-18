module.exports = {
    // TODO: Remove this entire section.  We can hard-code these in the fetchData.js file.
    urls: {
        scheduleUrl: 'https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=2024-08-04&endDate=2024-08-04&filterType=sports&filterValue=archery&inPattern=true',
        liveFeedUrl: 'live_feed_url',
        medalCountUrl: 'medal_count_url'
    },
    announcementTime: '0 0 * * *'  // Midnight every day
};
