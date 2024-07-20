const Event = require('./Event');

class DailySchedule {
    constructor(date) {
        this.date = date;
        this.sports = {};
    }

    addEvent(sportName, event) {
        if (!this.sports[sportName]) {
            this.sports[sportName] = [];
        }
        this.sports[sportName].push(new Event(event));
    }

    getEventsBySport(sportName) {
        return this.sports[sportName] || [];
    }

    getAllSports() {
        return Object.keys(this.sports);
    }
}

module.exports = DailySchedule;