const fetchOlympicsData = require('../utils/fetchData');
const { urls } = require('../config');
const { Client, Intents, MessageEmbed } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

let alertedEvents = new Set();

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Polling function
  const pollForNewEvents = async () => {
    //const events = await fetchOlympicsData(urls.scheduleUrl);
    const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds

    events.forEach(event => {
      if (event.startDate <= currentTime && !alertedEvents.has(event.eventId)) {
        alertedEvents.add(event.eventId);

        const channel = client.channels.cache.get('YOUR_CHANNEL_ID');
        if (channel) {
          const embed = new MessageEmbed()
            .setTitle(`Event Started: ${event.title}`)
            .setDescription(`
              sport: ${event.sport.title}
              ${event.summary}
              
              [Watch it here!](${event.videoURL})
            `)
            .setThumbnail(event.thumbnail)
            .setColor('#FFA500');

          channel.send({ embeds: [embed] });
        }
      }
    });
  };

  // Run the polling function immediately and then every 10 minutes
  await pollForNewEvents();
  setInterval(pollForNewEvents, 10 * 60 * 1000); // 10 minutes interval
});

client.login(process.env.DISCORD_TOKEN);
