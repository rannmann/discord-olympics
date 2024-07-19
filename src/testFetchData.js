const { getScheduleForSportOnDate, getSummerGamesUrlIds, getAllSummerGamesSchedules } = require('./utils/fetchData');

(async () => {
  try {
    //const events = await getScheduleForSportOnDate('archery', '2024-08-04');
    //console.log('Fetched Events:');
    //console.log(events);

    //console.log('Fetching all summer games schedules...');
    //console.log(getSummerGamesUrlIds());

    console.log('Fetching all summer games schedules for 2024-08-04...');
    console.log(await getAllSummerGamesSchedules('2024-08-04'));
  } catch (error) {
    console.error('Error while testing fetch data:', error);
  }
})();
