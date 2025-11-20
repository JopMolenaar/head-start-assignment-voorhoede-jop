export interface WeatherResponse {
  address: string;
  currentConditions: CurrentConditions;
  days: WeatherDay[];
}
export interface CurrentConditions {
  datetime: string;
  temp: number;
  icon?: string;
  conditions: string;
  // add more fields if needed from the API
}
export interface WeatherDay {
  datetime: string;
  temp: number;
  tempmax: number;
  tempmin: number;
  icon?: string;
  conditions: string;
}

const el = document.getElementById('weather-block')!;
const output = document.getElementById('weather-output')!;
const cityInput = document.getElementById('city-input')! as HTMLInputElement;
const searchCityBtn = document.getElementById('search-button')!;
const useLocationBtn = document.getElementById('geolocation-button')!;

const defaultCity = el.dataset.defaultCity || 'Amsterdam';
const forecast = el.dataset.forecast === 'true';

// Fetch weather data
async function fetchWeatherByCity(city: string) {
  output.textContent = 'Loading weather...';

  const url = `/api/weather/${encodeURIComponent(city)}`;
  
  const res = await fetch(url);
  const data = await res.json();

  if(data.error) {
    console.error('Error fetching weather data:', data.details);
    output.textContent = 'Couldn`t find the location.';
    return;
  }  

  renderWeather(data);
}

async function fetchWeatherByCoords(lat: number, lon: number) {
  const query = `${lat},${lon}`;
  fetchWeatherByCity(query);
}


// Render weather + forecast
function renderWeather(data: WeatherResponse) {
  const day = data.days[0]; // there is data of today in the days array that is not in the currentConditions
  const current = data.currentConditions;
  const icon = current.icon
    ? `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${current.icon}.png`
    : '';

  let locationDisplay = data.address;
  if (/^\d+(\.\d+)?,\s*\d+(\.\d+)?$/.test(data.address)) {
    locationDisplay = 'your location';
    // TODO SET ACTIVE ON MY LOCATION BUTTON
  } else {
    // TODO remove ACTIVE ON MY LOCATION BUTTON
  }

  output.innerHTML = `
    <p>${new Date(day.datetime).toLocaleDateString('en-EN', { weekday: 'long' })}; at ${locationDisplay}</p>
    <div class="weather-now">
        <p><strong style="font-size:2rem;">${current.temp}°C</strong></p>
        <p>${day.tempmax}° / ${day.tempmin}°</p>
        <img src="${icon}" alt="A weather icon that represents the weathercondition; ${current.conditions}" />
    </div>
  `;

  if (forecast && data.days) renderForecast(data.days);
}

function renderForecast(days: WeatherDay[]) {
  const container = document.createElement('div');
  container.className = 'weather-forecast';

  // Skip today and show the next 5 days
  days.slice(1, 6).forEach((day) => {
    const icon = day.icon
      ? `https://raw.githubusercontent.com/visualcrossing/WeatherIcons/main/PNG/4th%20Set%20-%20Color/${day.icon}.png`
      : '';

    const el = document.createElement('div');
    el.className = 'weather-forecast-day';
    el.innerHTML = `
      <p>${new Date(day.datetime).toLocaleDateString('en-EN', { weekday: 'short' })}</p>
      <img src="${icon}" alt="A weather icon that represents the weathercondition; ${day.conditions}" />
      <p>${day.tempmax}° / ${day.tempmin}°</p>
    `;
    container.appendChild(el);
  });

  output.appendChild(container);
}


// Search by city or location
searchCityBtn.addEventListener('click', () => {
  if (!cityInput.value) {
    cityInput.classList.add('input-error');
    return;
  } else {
    cityInput.classList.remove('input-error');
  }

  fetchWeatherByCity(cityInput.value);
  cityInput.value = '';
});

useLocationBtn.addEventListener('click', async () => {
  fetchWeatherByLocation(true);
});

// Use location
async function fetchWeatherByLocation(userInput: boolean) {
  if (!navigator.geolocation) {
    console.log('Geolocation not supported, using default city');
    fetchWeatherByCity(defaultCity);
    return;
  }

  // Check geolocation permission *without triggering popup*
  const permission = await navigator.permissions.query({ name: 'geolocation' });

  if (permission.state === 'granted') {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // TODO Give error message that using current location is not working
        fetchWeatherByCity(defaultCity);
      },
    );
  } else if (permission.state === 'prompt' && userInput) {
    // User has never chosen → calling getCurrentPosition triggers popup
    navigator.geolocation.getCurrentPosition(
      pos => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        console.log('User denied or closed popup. Using default city.');
        fetchWeatherByCity(defaultCity);
      }
    );
  } else if (permission.state === 'denied') {
    console.log('Location denied. Using default city');
    // TODO show UI message “enable location in browser settings”
    fetchWeatherByCity(defaultCity);
  } else {
    // Use the default city when entering the page for the first time
    fetchWeatherByCity(defaultCity);
  }
}

fetchWeatherByLocation(false);