const schedule = require('node-schedule');
const { getRawScheduleForSportOnDate } = require('../utils/fetchData');
const knex = require('knex')(require('../../knexfile').development);
const { scheduleUpdateTime } = require('../config');
require('dotenv').config();

async function handleSportUpdate(sport) {
    // TODO: Update date param to use YYYY-MM-DD
    const date = new Date();
    const scheduleData = await getRawScheduleForSportOnDate(sport.machine_name, date.toISOString().split('T')[0]);

    if (scheduleData.length === 0) {
        console.log('No schedule data found for sport:', sport.machine_name, ' on ', date.toISOString().split('T')[0]);
        return;
    }

    console.log('Found ', scheduleData.length, ' events for sport:', sport.machine_name, ' on ', date.toISOString().split('T')[0]);

    for (const event of scheduleData) {
        // Insert sports
        /*for (const sport of event.sports || []) {
          await knex('sports').insert({
            id: sport.drupalId,
            name: sport.title,
            machine_name: sport.machineName,
            games_league: sport.gameType,
            active: sport.active !== undefined ? sport.active : true // Default to true if active is undefined
          }).onConflict('id').ignore();
        }*/

        // Insert countries
        for (const country of event.countries || []) {
            await knex('countries').insert({
                id: country.drupalId,
                name: country.title,
                code: country.code
            }).onConflict('id').ignore();
            await knex('event_countries').insert({
                event_id: event.drupalId,
                country_id: country.drupalId
            }).onConflict(['event_id', 'country_id']).ignore();
        }

        // Insert athletes
        for (const athlete of event.athletes || []) {
            await knex('athletes').insert({
                id: athlete.drupalId,
                type: athlete.entityType,
                name: athlete.title,
                machine_name: athlete.machineName,
                athlete_id: athlete.athleteId
            }).onConflict('id').ignore();

            await knex('event_athletes').insert({
                event_id: event.drupalId,
                athlete_id: athlete.drupalId
            }).onConflict(['event_id', 'athlete_id']).ignore();
        }

        if (event.singleEvent === undefined) {
            console.warn('No single event found for event:', event.title);
            console.debug(event);
            continue;
        }

        // Insert events
        await knex('events').insert({
            id: event.drupalId,
            title: event.singleEvent.title,
            status: event.singleEvent.status,
            start_date: new Date(event.singleEvent.startDate),
            end_date: new Date(event.singleEvent.endDate),
            is_medal_session: false,
            video_url: event.singleEvent.videoURL,
            hero_image: event.singleEvent.heroImage.path,
            thumbnail: event.singleEvent.thumbnail.path,
            summary: event.singleEvent.summary
        }).onConflict('id').ignore();

        for (const s of event.sports || []) {
            await knex('event_sports').insert({
                event_id: event.drupalId,
                sport_id: s.drupalId
            }).onConflict(['event_id', 'sport_id']).ignore();
        }
    }
}

async function updateTableData() {
    console.log('Updating table data...');

    const sports = await knex('sports').where('games_league', 'summer');

    try {
        // Run updates for each sport in parallel
        await Promise.all(sports.map(handleSportUpdate));

        console.log('Table data updated successfully');
    } catch (error) {
        console.error('Error updating table data:', error);
    }
}

function scheduleUpdateTableData() {
    // Run the update once on startup
    updateTableData();

    // Schedule the update to run periodically
    schedule.scheduleJob(scheduleUpdateTime, updateTableData);
}

module.exports = scheduleUpdateTableData;