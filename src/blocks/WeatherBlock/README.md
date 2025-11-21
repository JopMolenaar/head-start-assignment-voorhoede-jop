# WeatherBlock

**Renders a block with weather information from the Visual Crossing API, along with options for a default city and showing the forecast set in DatoCMS.**

## Features

- Shows the weather information from the visualcrossing API
    - The default city (from DatoCMS) is used first if the user doesn't share their location.
    - The user can use their location to get the weather information, or type in a city in the search bar in the weatherblock.
- Turn on/off the forecast in DatoCMS

## API

- Create an account for [visualcrossing](https://www.visualcrossing.com/) and create an API key.
- Paste this API key in your .env `VISUALCROSSING_KEY=<your-api-key>`