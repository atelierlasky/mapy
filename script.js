// Initialize the map
const map = L.map('map', {
  zoomControl: false, // Disable default zoom controls
}).setView([50.0755, 14.4378], 13);

let currentPolyline = null;
let currentMarker = null;
let routeData = []; // Array to store route and pin data
let isDrawing = false; // Indicates if the user is drawing a route
let isPlacingPin = false; // Indicates if the user is placing a pin

// Add map layers (light and dark themes)
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
});

// Add custom zoom controls
L.control.zoom({
  position: 'topleft', // Move zoom controls to the left side
}).addTo(map);

// Automatically update the overlay text
document.getElementById('mapText').addEventListener('input', (e) => {
  document.getElementById('mapTitle').textContent = e.target.value || 'Vaše vzpomínka';
});

document.getElementById('mapCustomText').addEventListener('input', (e) => {
  document.getElementById('mapTextDisplay').textContent = e.target.value || 'Váš text';
});

// Set cursor style
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Clear all layers from the map
function clearMap() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  routeData = [];
  currentPolyline = null;
  currentMarker = null;
  isDrawing = false;
  isPlacingPin = false;
}

// Add a pin to the map
function placePin() {
  if (isDrawing) clearMap(); // Clear all layers if switching mode
  isPlacingPin = true;
  isDrawing = false;
  setCursor('crosshair-cursor');

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;', // Heart icon
        iconSize: [60, 60], // Increase heart size
      }),
    }).addTo(map);

    routeData = [{ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng }]; // Store pin data
    setCursor('default-cursor');
  });
}

// Draw a route on the map
function drawRoute() {
  if (isPlacingPin) clearMap(); // Clear all layers if switching mode
  isDrawing = true;
  isPlacingPin = false;
  setCursor('crosshair-cursor');

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    if (routeData.length === 0) {
      // Add a heart icon at the start of the route
      currentMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'heart-icon',
          html: '&#x2764;', // Heart icon
          iconSize: [60, 60],
        }),
      }).addTo(map);
    }

    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng }); // Store route data
  });
}

// Toggle map themes
function toggleTheme() {
  if (map.hasLayer(lightTheme)) {
    map.removeLayer(lightTheme);
    darkTheme.addTo(map);
  } else {
    map.removeLayer(darkTheme);
    lightTheme.addTo(map);
  }
}

// Validate the form before submission
function validateForm(event) {
  if (routeData.length === 0) {
    alert('Mapa musí obsahovat alespoň 1 bod nebo trasu!');
    event.preventDefault();
    return false;
  }

  // Check if all required fields are filled
  const title = document.getElementById('mapText').value.trim();
  const customText = document.getElementById('mapCustomText').value.trim();
  const email = document.getElementById('userEmail').value.trim();

  if (!title || !customText || !email) {
    alert('Vyplňte prosím všechna pole ve formuláři!');
    event.preventDefault();
    return false;
  }

  return true;
}

// Prepare data and URL before form submission
document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');

  // Generate JSON data
  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // For the 'route' field
  jsonCodeField.value = jsonData; // For the 'json_code' field

  // Add a static map URL (example)
  const mapImageURL = `https://example.com/map?data=${encodeURIComponent(jsonData)}`;
  mapImageField.value = mapImageURL;
});

// Add event listeners to buttons
document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
document.getElementById('resetMap').addEventListener('click', clearMap);
