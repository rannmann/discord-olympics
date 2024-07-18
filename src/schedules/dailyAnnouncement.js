const schedule = require('node-schedule');
const fetchOlympicsData = require('../utils/fetchData');
const { urls, announcementTime } = require('../config');
const { Client, Intents } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  schedule.scheduleJob(announcementTime, async () => {
    const events = await fetchOlympicsData(urls.scheduleUrl);
    
    // Process and send messages
    events.forEach(event => {
      const channel = client.channels.cache.get('YOUR_CHANNEL_ID');
      if (channel) {
        const participants = event.participants.join(', ');
        channel.send(`
          **${event.title}**
          Status: ${event.status}
          Start: <t:${Math.floor(event.startDate)}:t>
          End: <t:${Math.floor(event.endDate)}:t>
          Sport: ${event.sport.title}
          Participants: ${participants}

          ${event.summary}

          [Watch Video](${event.videoURL})
        `);
      }
    });
  });
});