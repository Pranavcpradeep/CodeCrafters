// OpenWeatherMap API Configuration
// IMPORTANT: Replace 'YOUR_API_KEY' with your actual OpenWeatherMap API key
// Get your free API key at: https://openweathermap.org/api
const API_KEY = 'd0f3c19193edc55332266a08c80535a4';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const REVERSE_GEOCODING_API_URL = 'https://api.openweathermap.org/geo/1.0/reverse';

// Popular cities for autocomplete suggestions
const POPULAR_CITIES = [
    'New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai', 'Dubai',
    'Singapore', 'Hong Kong', 'Bangkok', 'Moscow', 'Berlin', 'Rome',
    'Madrid', 'Toronto', 'Los Angeles', 'Chicago', 'Miami', 'Seattle',
    'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune',
    'Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Palakkad', 'Akathethara'
];

// Initialize variables
let map = null;
let weatherMap = null;
let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];

// Initialize map
function initMap(lat = 10.7844, lon = 76.6542) {
    if (weatherMap) {
        weatherMap.remove();
    }
    
    weatherMap = L.map('weather-map').setView([lat, lon], 10);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(weatherMap);
    
    // Add weather layer (requires API key to work properly)
    // For demo purposes, showing regular map
    // With API key, you can add: https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API_KEY}
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    document.getElementById('date-time').textContent = now.toLocaleDateString('en-US', options);
}

// Get weather icon based on condition
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌦️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
}

// Fetch weather data
async function fetchWeather(cityName) {
    try {
        // First, get coordinates from city name
        const geoResponse = await fetch(`${GEOCODING_API_URL}?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error('City not found');
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData || geoData.length === 0) {
            throw new Error('City not found');
        }
        
        const { lat, lon, name, state, country } = geoData[0];
        
        // Fetch current weather
        const weatherResponse = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        
        if (!weatherResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }
        
        const weatherData = await weatherResponse.json();
        
        // Fetch forecast
        const forecastResponse = await fetch(`${FORECAST_API_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastResponse.ok ? await forecastResponse.json() : null;
        
        // Display weather
        displayWeather(weatherData, forecastData, name, state, country);
        
        // Update map
        initMap(lat, lon);
        L.marker([lat, lon]).addTo(weatherMap).bindPopup(`<strong>${name}</strong><br>${weatherData.weather[0].description}`);
        
        // Add to recent cities
        addToRecentCities(name);
        
        return { lat, lon };
    } catch (error) {
        console.error('Error fetching weather:', error);
        showError(`Error: ${error.message}. Please check your API key or try another city.`);
        return null;
    }
}

// Display weather data
function displayWeather(data, forecastData, cityName, state, country) {
    const location = state ? `${cityName}, ${state}, ${country}` : `${cityName}, ${country}`;
    
    const cityNameEl = document.getElementById('city-name');
    const tempEl = document.getElementById('temperature');
    const descEl = document.getElementById('weather-description');
    const iconEl = document.getElementById('weather-icon');
    const feelsLikeEl = document.getElementById('feels-like');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const pressureEl = document.getElementById('pressure');
    const visibilityEl = document.getElementById('visibility');
    const uvIndexEl = document.getElementById('uv-index');
    
    if (!cityNameEl || !tempEl || !descEl || !iconEl) {
        console.error('Weather display elements not found in DOM');
        return;
    }
    
    cityNameEl.textContent = location;
    tempEl.textContent = Math.round(data.main.temp);
    descEl.textContent = data.weather[0].description;
    iconEl.textContent = getWeatherIcon(data.weather[0].icon);
    
    if (feelsLikeEl) feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
    if (humidityEl) humidityEl.textContent = `${data.main.humidity}%`;
    if (windSpeedEl) windSpeedEl.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    if (pressureEl) pressureEl.textContent = `${data.main.pressure} hPa`;
    if (visibilityEl) visibilityEl.textContent = data.visibility ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A';
    
    // UV Index (not always available in free API)
    if (uvIndexEl) {
        if (data.uvi !== undefined) {
            uvIndexEl.textContent = data.uvi;
        } else {
            uvIndexEl.textContent = 'N/A';
        }
    }
    
    // Display forecast
    if (forecastData) {
        displayForecast(forecastData.list);
    }
}

// Display 5-day forecast
function displayForecast(forecastList) {
    const container = document.getElementById('forecast-container');
    container.innerHTML = '';
    
    // Group by day and get one forecast per day
    const dailyForecasts = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    forecastList.slice(0, 40).forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toDateString();
        
        if (!dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = {
                date: date,
                temps: [],
                icon: item.weather[0].icon,
                description: item.weather[0].description
            };
        }
        dailyForecasts[dayKey].temps.push(item.main.temp);
        dailyForecasts[dayKey].temps.push(item.main.temp_max);
        dailyForecasts[dayKey].temps.push(item.main.temp_min);
    });
    
    // Get first 5 days
    const forecastDays = Object.values(dailyForecasts).slice(0, 5);
    
    forecastDays.forEach((forecast, index) => {
        const maxTemp = Math.max(...forecast.temps);
        const minTemp = Math.min(...forecast.temps);
        const dayName = index === 0 ? 'Today' : days[forecast.date.getDay()];
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-icon">${getWeatherIcon(forecast.icon)}</div>
            <div class="forecast-temp">
                <span class="forecast-high">${Math.round(maxTemp)}°</span>
                <span class="forecast-low">${Math.round(minTemp)}°</span>
            </div>
            <div class="forecast-desc">${forecast.description}</div>
        `;
        container.appendChild(forecastItem);
    });
}

// Show error message
function showError(message) {
    const weatherCard = document.getElementById('weather-card');
    const existingError = weatherCard.querySelector('.error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    weatherCard.appendChild(errorDiv);
}

// Search for cities (autocomplete)
async function searchCities(query) {
    if (!query || query.length < 2) {
        document.getElementById('dropdown').classList.remove('show');
        return;
    }
    
    // Filter popular cities
    const matches = POPULAR_CITIES.filter(city => 
        city.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
    
    const dropdown = document.getElementById('dropdown');
    dropdown.innerHTML = '';
    
    if (matches.length === 0) {
        dropdown.classList.remove('show');
        return;
    }
    
    matches.forEach(city => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = city;
        item.addEventListener('click', () => {
            document.getElementById('city-input').value = city;
            dropdown.classList.remove('show');
            handleSearch(city);
        });
        dropdown.appendChild(item);
    });
    
    dropdown.classList.add('show');
}

// Add to recent cities
function addToRecentCities(cityName) {
    if (!recentCities.includes(cityName)) {
        recentCities.unshift(cityName);
        if (recentCities.length > 10) {
            recentCities.pop();
        }
        localStorage.setItem('recentCities', JSON.stringify(recentCities));
        updateRecentCities();
    }
}

// Update recent cities display
function updateRecentCities() {
    const container = document.getElementById('recent-cities-list');
    container.innerHTML = '';
    
    recentCities.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'recent-city-chip';
        chip.textContent = city;
        chip.addEventListener('click', () => {
            document.getElementById('city-input').value = city;
            handleSearch(city);
        });
        container.appendChild(chip);
    });
}

// Handle search
async function handleSearch(cityName) {
    if (!cityName || cityName.trim() === '') {
        return;
    }
    
    // Check API key
    if (API_KEY === 'YOUR_API_KEY') {
        showError('Please add your OpenWeatherMap API key in script.js. Get one at: https://openweathermap.org/api');
        return;
    }
    
    document.getElementById('dropdown').classList.remove('show');
    
    // Show loading state in temperature (don't destroy structure)
    const tempElement = document.getElementById('temperature');
    if (tempElement) {
        tempElement.textContent = '...';
    }
    const descElement = document.getElementById('weather-description');
    if (descElement) {
        descElement.textContent = 'Loading...';
    }
    
    await fetchWeather(cityName.trim());
}

// Event listeners
document.getElementById('search-btn').addEventListener('click', () => {
    const cityInput = document.getElementById('city-input');
    handleSearch(cityInput.value);
});

document.getElementById('city-input').addEventListener('input', (e) => {
    searchCities(e.target.value);
});

document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch(e.target.value);
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdown');
    const input = document.getElementById('city-input');
    if (!dropdown.contains(e.target) && e.target !== input) {
        dropdown.classList.remove('show');
    }
});

// Initialize
window.addEventListener('load', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    initMap();
    updateRecentCities();
    
    // Try to get user location and show weather
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    const response = await fetch(`${REVERSE_GEOCODING_API_URL}?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length > 0) {
                            const cityName = data[0].name;
                            document.getElementById('city-input').value = cityName;
                            await fetchWeather(cityName);
                        }
                    }
                } catch (error) {
                    console.error('Error getting location weather:', error);
                }
            },
            (error) => {
                console.log('Geolocation not available or denied');
            }
        );
    }
});
