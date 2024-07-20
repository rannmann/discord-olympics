const Event = require('../models/Event');

module.exports = (event) => {
    const getParticipants = () => {
      // Prioritize countries
      if (event.countries && event.countries.length > 0) {
        return event.countries.map(country => country.title);
      }
      // Fallback to athletes
      return event.athletes ? event.athletes.map(athlete => athlete.title) : [];
    };
  
    const simplifiedEvent = new Event({
      eventId: event.drupalId,
      title: event.singleEvent.title,
      status: event.singleEvent.status,
      startDate: event.singleEvent.startDate,
      endDate: event.singleEvent.endDate,
      isMedalSession: event.singleEvent.isMedalSession,
      sport: {
        title: event.sports[0].title,
        code: event.sports[0].code
      },
      participants: getParticipants(),
      videoURL: event.singleEvent.videoURL,
      heroImage: event.singleEvent.heroImage?.path,
      thumbnail: event.singleEvent.thumbnail?.path,
      summary: event.singleEvent.summary
    });
  
    return simplifiedEvent;
  };