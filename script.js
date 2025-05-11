function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found.');
    return null;
  }

  const map = L.map('map').setView([50.0755, 14.4378], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  return map;
}

const map = initializeMap();
let currentPolyline = null;
let currentMarker = null;
let routeData = [];
let isDrawing = false;
let isPlacingPin = false;

function clearMap() {
  if (!map) return;
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  routeData = [];
  currentPolyline = null;
  currentMarker = null;
}

function placePin() {
  if (!map) return;
  clearMap();
  isPlacingPin = true;

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [80, 80],
      }),
    }).addTo(map);
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

function drawRoute() {
  if (!map) return;
  clearMap();
  isDrawing = true;

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

document.getElementById('mapText').addEventListener('input', (e) => {
  document.getElementById('mapTitle').textContent = e.target.value || 'Vaše vzpomínka';
});

document.getElementById('mapCustomText').addEventListener('input', (e) => {
  document.getElementById('mapTextDisplay').textContent = e.target.value || 'Váš text';
});

function validateForm(event) {
  if (routeData.length === 0) {
    alert('Mapa musí obsahovat alespoň 1 bod nebo trasu!');
    event.preventDefault();
    return false;
  }

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

function generateEditorURL() {
  const baseURL = 'https://www.mapeditor.com';
  const coordinates = routeData.map((point) => `${point.lng},${point.lat}`).join(';');
  return `${baseURL}?data=${encodeURIComponent(coordinates)}`;
}

document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');
  const editorURLField = document.createElement('input');

  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData;
  jsonCodeField.value = jsonData;

  mapImageField.value = `https://staticmap.example.com?data=${encodeURIComponent(jsonData)}`;
  editorURLField.type = 'hidden';
  editorURLField.name = 'editor_url';
  editorURLField.value = generateEditorURL();
  document.getElementById('mapForm').appendChild(editorURLField);
});

document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('resetMap').addEventListener('click', clearMap);
