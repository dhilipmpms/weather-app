async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    const currentDiv = document.getElementById("currentWeather");
    const hourlyDiv = document.getElementById("hourlyWeather");

    if (!city) {
        currentDiv.innerHTML = "❌ Enter a city name";
        return;
    }

    // 1️⃣ Geocoding: City → Latitude & Longitude
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

    try {
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results) {
            currentDiv.innerHTML = "❌ City not found";
            return;
        }

        const { latitude, longitude, name, country } = geoData.results[0];

        // 2️⃣ Weather API
        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,is_day` +
            `&hourly=temperature_2m,relative_humidity_2m` +
            `&timezone=auto`;

        const weatherRes = await fetch(weatherUrl);
        const data = await weatherRes.json();

        const current = data.current;
        const time = new Date(data.current.time).toLocaleString();

        // Day / Night icon
        const icon = current.is_day === 1 ? "☀️" : "🌙";

        // 3️⃣ Display current weather
        currentDiv.innerHTML = `
            <h3>${name}, ${country}</h3>
            <p>${time}</p>
            <div class="icon">${icon}</div>
            <p>🌡 Temp: ${current.temperature_2m} °C</p>
            <p>💧 Humidity: ${current.relative_humidity_2m} %</p>
        `;

        // 4️⃣ 24-hour forecast
        hourlyDiv.innerHTML = "<h4>🌄 Next 24 Hours</h4>";
        for (let i = 0; i < 24; i++) {
            const hourTime = new Date(data.hourly.time[i]).getHours();
            hourlyDiv.innerHTML += `
                <p>
                    🕒 ${hourTime}:00 —
                    🌡 ${data.hourly.temperature_2m[i]} °C |
                    💧 ${data.hourly.relative_humidity_2m[i]} %
                </p>
            `;
        }

    } catch (error) {
        currentDiv.innerHTML = "⚠ Error fetching data";
        console.error(error);
    }
}
