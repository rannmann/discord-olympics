const { getScheduleForSportOnDate } = require('./utils/fetchData');

(async () => {
  try {
    const events = await getScheduleForSportOnDate('archery', '2024-08-04');

    console.log('Fetched Events:');
    console.log(events);
  } catch (error) {
    console.error('Error while testing fetch data:', error);
  }
})();
