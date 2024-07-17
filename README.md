This repo is an early WIP.

# Features

## Daily announcement

I want to show the timestamps of when each important game will start in the user's timestamp (using tags, like `<t:1543392060:t>`).  I want it broken into 3 sections:

1. Medaling events (bronze/silver/gold).
2. A list of all sports being played that day
3. Other Team USA games (that are not already covered in the medaling section).

## Live feed

I want a new message to be posted by the bot anytime a new event starts.  It should say the sport and the event name at minimum.  If there is team/player information, I would like that included as well.  This should be a short message since it's likely to be spammy.

## Medal Counter

I want a command that returns the current medal count only to the user who requested it, so we don't spoil it for anyone not watching live.


---

 I think I have a way to fetch the data I need.  The page seems to load this initially, which shows data about each sport:

https://www.nbcolympics.com/api/sport_front?sort=title&filter%5Bstatus%5D=1&include=sport&include=sport

It seems like we might want to store some data from there, but I'm not sure what yet, beyond the list of all the sports.

This one seems useful to have daily overview of each sport though: https://www.nbcolympics.com/api/high_level_schedule?include=sport&sort=drupal_internal__id

And when I click into any sport from the main page, it breaks down the actual events seemingly from this API call when I clicked Archery: https://schedules.nbcolympics.com/api/v1/schedule?timeZone=America%2FLos_Angeles&startDate=2024-01-01&endDate=2024-08-11&filterType=sports&filterValue=archery&inPattern=true