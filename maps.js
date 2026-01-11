// Main location: Akathethara, Palakkad, Kerala, India
const AKATHETHARA_CENTER = [10.7844, 76.6542];

// Safe spots data for disaster relief
const safeSpots = [
    {
        name: "Akathethara Government Higher Secondary School",
        coordinates: [10.7850, 76.6550],
        type: "School",
        capacity: "500+ people",
        facilities: "Water, Sanitation, First Aid",
        contact: "0491-XXX-XXXX"
    },
    {
        name: "Palakkad District Hospital",
        coordinates: [10.7900, 76.6500],
        type: "Hospital",
        capacity: "Emergency Services",
        facilities: "Medical, Emergency Care, Food",
        contact: "0491-252-XXXX"
    },
    {
        name: "Akathethara Community Center",
        coordinates: [10.7830, 76.6530],
        type: "Community Center",
        capacity: "300+ people",
        facilities: "Shelter, Food, Water",
        contact: "0491-XXX-XXXX"
    },
    {
        name: "Palakkad Railway Station Relief Center",
        coordinates: [10.7586, 76.6503],
        type: "Relief Center",
        capacity: "400+ people",
        facilities: "Transport, Shelter, Food",
        contact: "0491-252-XXXX"
    },
    {
        name: "Government Primary School - Akathethara",
        coordinates: [10.7820, 76.6560],
        type: "School",
        capacity: "200+ people",
        facilities: "Water, Basic Shelter",
        contact: "0491-XXX-XXXX"
    },
    {
        name: "Village Office - Akathethara",
        coordinates: [10.7845, 76.6545],
        type: "Government Office",
        capacity: "100+ people",
        facilities: "Coordination, Information",
        contact: "0491-XXX-XXXX"
    },
    {
        name: "Palakkad Collectorate",
        coordinates: [10.7748, 76.6587],
        type: "Government Office",
        capacity: "Emergency Coordination",
        facilities: "Full Emergency Services",
        contact: "0491-252-XXXX"
    },
    {
        name: "Akathethara Temple Premises",
        coordinates: [10.7855, 76.6540],
        type: "Religious Place",
        capacity: "250+ people",
        facilities: "Shelter, Community Support",
        contact: "Community Leaders"
    }
];

// Initialize map
let map = L.map('map').setView(AKATHETHARA_CENTER, 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// User location marker
let userMarker = null;
let userLocation = null;

// Safe spot markers
let safeSpotMarkers = [];
let safeSpotLayerGroup = L.layerGroup().addTo(map);

// Custom icons
const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div style="background-color: #FF0000; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const safeSpotIcon = L.divIcon({
    className: 'safe-spot-marker',
    html: '<div style="background-color: #28a745; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.4);"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const mainLocationIcon = L.divIcon({
    className: 'main-location-marker',
    html: '<div style="background-color: #667eea; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

// Initialize safe spots
function initializeSafeSpots() {
    safeSpots.forEach((spot, index) => {
        const marker = L.marker(spot.coordinates, { icon: safeSpotIcon })
            .addTo(safeSpotLayerGroup)
            .bindPopup(`
                <strong>${spot.name}</strong><br>
                <b>Type:</b> ${spot.type}<br>
                <b>Capacity:</b> ${spot.capacity}<br>
                <b>Facilities:</b> ${spot.facilities}<br>
                <b>Contact:</b> ${spot.contact}
            `);
        
        safeSpotMarkers.push({
            marker: marker,
            data: spot,
            distance: null
        });
    });
    
    updateSafeSpotsList();
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Update safe spots list with distances
function updateSafeSpotsList() {
    const listContainer = document.getElementById('safe-spots-list');
    listContainer.innerHTML = '';
    
    // Sort by distance if user location is available
    const sortedSpots = [...safeSpotMarkers];
    if (userLocation) {
        sortedSpots.forEach(item => {
            item.distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                item.data.coordinates[0],
                item.data.coordinates[1]
            );
        });
        sortedSpots.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }
    
    sortedSpots.forEach((item, index) => {
        const spot = item.data;
        const card = document.createElement('div');
        card.className = 'spot-card';
        card.onclick = () => {
            map.setView(spot.coordinates, 15);
            item.marker.openPopup();
        };
        
        let distanceHtml = '';
        if (item.distance !== null) {
            distanceHtml = `<p class="distance">📍 ${item.distance.toFixed(2)} km away</p>`;
        }
        
        card.innerHTML = `
            <h3>${spot.name}</h3>
            <p><strong>Type:</strong> ${spot.type}</p>
            <p><strong>Capacity:</strong> ${spot.capacity}</p>
            <p><strong>Facilities:</strong> ${spot.facilities}</p>
            <p><strong>Contact:</strong> ${spot.contact}</p>
            ${distanceHtml}
        `;
        
        listContainer.appendChild(card);
    });
}

// Get user's current location
function getUserLocation() {
    const statusDiv = document.getElementById('status');
    
    if (!navigator.geolocation) {
        statusDiv.textContent = '❌ Geolocation is not supported by your browser';
        statusDiv.style.color = '#dc3545';
        return;
    }
    
    statusDiv.textContent = '🔍 Locating...';
    statusDiv.style.color = '#667eea';
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userLocation = { lat, lng };
            
            // Remove existing user marker
            if (userMarker) {
                map.removeLayer(userMarker);
            }
            
            // Add new user marker
            userMarker = L.marker([lat, lng], { icon: userIcon })
                .addTo(map)
                .bindPopup('📍 Your Current Location')
                .openPopup();
            
            // Center map on user location
            map.setView([lat, lng], 14);
            
            statusDiv.textContent = `✅ Location found: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            statusDiv.style.color = '#28a745';
            
            // Update safe spots list with distances
            updateSafeSpotsList();
        },
        (error) => {
            let errorMsg = '❌ Error getting location: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    errorMsg += 'Permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMsg += 'Position unavailable';
                    break;
                case error.TIMEOUT:
                    errorMsg += 'Request timeout';
                    break;
                default:
                    errorMsg += 'Unknown error';
                    break;
            }
            statusDiv.textContent = errorMsg;
            statusDiv.style.color = '#dc3545';
            
            // Default to Akathethara if location fails
            map.setView(AKATHETHARA_CENTER, 13);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Center map to Akathethara
function centerToAkathethara() {
    map.setView(AKATHETHARA_CENTER, 13);
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = '📍 Centered to Akathethara, Palakkad';
    statusDiv.style.color = '#667eea';
}

// Event listeners
document.getElementById('locate-btn').addEventListener('click', getUserLocation);
document.getElementById('center-btn').addEventListener('click', centerToAkathethara);

// Add main location marker (Akathethara)
const mainLocationMarker = L.marker(AKATHETHARA_CENTER, { icon: mainLocationIcon })
    .addTo(map)
    .bindPopup('<strong>🏠 Akathethara, Palakkad</strong><br>Main Location - Kerala, India')
    .openPopup();

// Try to get user location automatically on page load
window.addEventListener('load', () => {
    // Initialize safe spots
    initializeSafeSpots();
    
    // Try to get user location automatically
    setTimeout(() => {
        getUserLocation();
    }, 500);
});
