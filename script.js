async function getWeather() {
    const cityName = document.getElementById("cityInput").value.trim();
    if (!cityName) {
        alert("Please enter a city name");
        return;
    }

    try {
        // 1️⃣ Geocoding: City → Latitude & Longitude
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            alert("City not found. Please try again.");
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2️⃣ Weather API
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,is_day` +
            `&daily=temperature_2m_max,temperature_2m_min` +
            `&timezone=auto`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        // 3️⃣ Update current weather
        document.getElementById("city").innerText = `${name}, ${country}`;
        document.getElementById("temperature").innerText =
            Math.round(data.current.temperature_2m) + "°C";
        document.getElementById("condition").innerText =
            data.current.is_day === 1 ? "Day" : "Night";
        document.getElementById("humidity").innerText =
            data.current.relative_humidity_2m + "%";
        document.getElementById("wind").innerText =
            Math.round(data.current.wind_speed_10m) + " km/h";
        document.getElementById("datetime").innerText =
            new Date(data.current.time).toLocaleString();

        // 4️⃣ Day / Night main icon (online SVG)
        document.getElementById("weatherIcon").src =
            data.current.is_day === 1
                ? "https://open-meteo.com/images/weather-icons/clear-day.svg"
                : "https://open-meteo.com/images/weather-icons/clear-night.svg";

        // 5️⃣ 5-Day Forecast
        const forecastDiv = document.getElementById("forecast");
        forecastDiv.innerHTML = "";

        for (let i = 0; i < 5; i++) {
            const dayName = new Date(data.daily.time[i])
                .toLocaleDateString("en-US", { weekday: "short" });

            forecastDiv.innerHTML += `
                <div class="day">
                    <p>${dayName}</p>
                    <img src="https://open-meteo.com/images/weather-icons/cloudy.svg">
                    <p>⬆ ${Math.round(data.daily.temperature_2m_max[i])}°</p>
                    <p>⬇ ${Math.round(data.daily.temperature_2m_min[i])}°</p>
                </div>
            `;
        }

    } catch (error) {
        console.error(error);
        alert("Error fetching weather data. Please try again.");
    }
}
