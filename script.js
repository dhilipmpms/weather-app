// Weather condition mapping based on WMO codes
const weatherConditions = {
    0: { description: 'Clear sky', icon: 'day-sunny.svg', nightIcon: 'night-clear.svg' },
    1: { description: 'Mainly clear', icon: 'day-sunny.svg', nightIcon: 'night-clear.svg' },
    2: { description: 'Partly cloudy', icon: 'day-cloudy.svg', nightIcon: 'night-clear.svg' },
    3: { description: 'Overcast', icon: 'cloudy.svg', nightIcon: 'cloudy.svg' },
    45: { description: 'Foggy', icon: 'cloudy.svg', nightIcon: 'cloudy.svg' },
    48: { description: 'Foggy', icon: 'cloudy.svg', nightIcon: 'cloudy.svg' },
    51: { description: 'Light drizzle', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    53: { description: 'Drizzle', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    55: { description: 'Heavy drizzle', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    61: { description: 'Light rain', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    63: { description: 'Rain', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    65: { description: 'Heavy rain', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    71: { description: 'Light snow', icon: 'snow.svg', nightIcon: 'snow.svg' },
    73: { description: 'Snow', icon: 'snow.svg', nightIcon: 'snow.svg' },
    75: { description: 'Heavy snow', icon: 'snow.svg', nightIcon: 'snow.svg' },
    80: { description: 'Light showers', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    81: { description: 'Showers', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    82: { description: 'Heavy showers', icon: 'rainy.svg', nightIcon: 'rainy.svg' },
    95: { description: 'Thunderstorm', icon: 'thunderstorm.svg', nightIcon: 'thunderstorm.svg' },
    96: { description: 'Thunderstorm with hail', icon: 'thunderstorm.svg', nightIcon: 'thunderstorm.svg' },
    99: { description: 'Thunderstorm with hail', icon: 'thunderstorm.svg', nightIcon: 'thunderstorm.svg' }
};

function getWeatherCondition(code, isDay) {
    const condition = weatherConditions[code] || weatherConditions[0];
    return {
        description: condition.description,
        icon: isDay ? condition.icon : condition.nightIcon
    };
}

async function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
        },
        (error) => {
            alert('Unable to retrieve your location. Please enter a city name.');
        }
    );
}

async function getWeather() {
    const cityName = document.getElementById("cityInput").value.trim();
    if (!cityName) {
        alert("Please enter a city name");
        return;
    }

    try {
        // Geocoding: City → Latitude & Longitude
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            alert("City not found. Please try again.");
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        await fetchWeatherData(latitude, longitude, `${name}, ${country}`);

    } catch (error) {
        console.error(error);
        alert("Error fetching weather data. Please try again.");
    }
}

async function fetchWeatherData(latitude, longitude, locationName = null) {
    try {
        // Weather API with weather code
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day` +
            `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
            `&timezone=auto`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        // If no location name provided (from current location), get it via reverse geocoding
        if (!locationName) {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?latitude=${latitude}&longitude=${longitude}&count=1`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();
            if (geoData.results && geoData.results[0]) {
                locationName = `${geoData.results[0].name}, ${geoData.results[0].country}`;
            } else {
                locationName = `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
            }
        }

        // Update current weather
        document.getElementById("city").innerText = locationName;
        document.getElementById("temperature").innerText = Math.round(data.current.temperature_2m);

        const weatherInfo = getWeatherCondition(data.current.weather_code, data.current.is_day === 1);
        document.getElementById("condition").innerText = weatherInfo.description;

        document.getElementById("feelsLike").innerText = Math.round(data.current.apparent_temperature) + "°C";
        document.getElementById("humidity").innerText = data.current.relative_humidity_2m + "%";
        document.getElementById("wind").innerText = Math.round(data.current.wind_speed_10m) + " km/h";

        const now = new Date(data.current.time);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById("datetime").innerText = now.toLocaleDateString('en-US', options);

        // Main weather icon
        document.getElementById("weatherIcon").src = `icons/${weatherInfo.icon}`;

        // 5-Day Forecast
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";

        for (let i = 0; i < 5; i++) {
            const date = new Date(data.daily.time[i]);
            const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
            const forecastWeather = getWeatherCondition(data.daily.weather_code[i], true);

            forecastDiv.innerHTML += `
                <div class="forecast-day">
                    <p>${dayName}</p>
                    <img src="icons/${forecastWeather.icon}" alt="${forecastWeather.description}">
                    <div class="temp-range">
                        <span class="temp-high">${Math.round(data.daily.temperature_2m_max[i])}°</span>
                        <span class="temp-low">${Math.round(data.daily.temperature_2m_min[i])}°</span>
                    </div>
                    <p class="condition">${forecastWeather.description}</p>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);
        alert("Error fetching weather data. Please try again.");
    }
}

// Load default city on page load
window.addEventListener('load', () => {
    document.getElementById("cityInput").value = "Toronto";
    getWeather();
});
