// Replace 'YOUR_API_KEY_HERE' with your actual OpenWeatherMap API key
const API_KEY = '';

async function getWeather() {
    const cityName = document.getElementById("cityInput").value;
    if (!cityName) {
        alert("Please enter a city name");
        return;
    }

    try {
        // Fetch current weather
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
        const weatherRes = await fetch(weatherUrl);
        
        if (!weatherRes.ok) {
            if (weatherRes.status === 404) {
                alert("City not found. Please try again.");
            } else if (weatherRes.status === 401) {
                alert("Invalid API key. Please check your API key.");
            } else {
                alert("Error fetching weather data. Please try again.");
            }
            return;
        }
        
        const weatherData = await weatherRes.json();

        // Fetch 5-day forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        // Update current weather
        document.getElementById("city").innerText = `${weatherData.name}, ${weatherData.sys.country}`;
        document.getElementById("temperature").innerText = Math.round(weatherData.main.temp) + "°C";
        document.getElementById("condition").innerText = weatherData.weather[0].description;
        document.getElementById("humidity").innerText = weatherData.main.humidity + "%";
        document.getElementById("wind").innerText = Math.round(weatherData.wind.speed * 3.6) + " km/h";
        document.getElementById("datetime").innerText = new Date().toLocaleString();

        // Update weather icon based on condition
        const weatherIcon = getWeatherIcon(weatherData.weather[0].main, weatherData.weather[0].id);
        document.getElementById("icon").innerText = weatherIcon;

        // Update 5-day forecast
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";

        // Group forecast by day (API returns 3-hour intervals)
        const dailyForecasts = {};
        forecastData.list.forEach(item => {
            const date = new Date(item.dt * 1000).toLocaleDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    temps: [],
                    date: new Date(item.dt * 1000)
                };
            }
            dailyForecasts[date].temps.push(item.main.temp);
        });

        // Display first 5 days
        const days = Object.values(dailyForecasts).slice(0, 5);
        days.forEach(day => {
            const maxTemp = Math.round(Math.max(...day.temps));
            const minTemp = Math.round(Math.min(...day.temps));
            const dayName = day.date.toLocaleDateString("en-US", { weekday: "short" });

            forecastDiv.innerHTML += `
                <div class="day">
                    <p>${dayName}</p>
                    <p>⬆ ${maxTemp}°</p>
                    <p>⬇ ${minTemp}°</p>
                </div>
            `;
        });

    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please check your internet connection and try again.");
    }
}

function getWeatherIcon(main, id) {
    // Map weather conditions to emojis
    switch (main) {
        case "Clear":
            return "☀️";
        case "Clouds":
            return id === 801 ? "🌤️" : id === 802 ? "⛅" : "☁️";
        case "Rain":
            return id >= 500 && id < 510 ? "🌧️" : "🌦️";
        case "Drizzle":
            return "🌦️";
        case "Thunderstorm":
            return "⛈️";
        case "Snow":
            return "🌨️";
        case "Mist":
        case "Fog":
        case "Haze":
            return "🌫️";
        default:
            return "🌡️";
    }
}
