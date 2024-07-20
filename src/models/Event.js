const Sport = require('./Sport');

class Event {
    constructor({
        eventId,
        title,
        status,
        startDate,
        endDate,
        isMedalSession,
        sport,
        participants,
        videoURL,
        heroImage,
        thumbnail,
        summary
    }) {
        this.eventId = eventId;
        this.title = title;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isMedalSession = isMedalSession;
        this.sport = new Sport(sport);
        this.participants = participants;
        this.videoURL = videoURL;
        this.heroImage = heroImage;
        this.thumbnail = thumbnail;
        this.summary = summary;
    }
}

module.exports = Event;