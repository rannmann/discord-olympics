require('dotenv').config();
// Quick test script to verify data fetching works
const { getMedalTableData, getScheduleOverview } = require('./utils/fetchData');

async function test() {
    console.log('=== Medal Table ===');
    const medals = await getMedalTableData();
    medals.forEach(m => {
        console.log(`${m.rank}. ${m.country} — 🥇${m.gold} 🥈${m.silver} 🥉${m.bronze} (${m.total})`);
    });

    console.log('\n=== Sports Schedule ===');
    const sports = await getScheduleOverview();
    sports.forEach(s => {
        console.log(`${s.name}: ${s.totalMedalEvents} medal events, ${s.competitionDays} competition days`);
    });
}

test().catch(console.error);
