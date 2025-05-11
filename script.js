// Funkce pro inicializaci mapy s ochranou
function initializeMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Map container not found. Please ensure that #map exists in the HTML.');
    return null;
  }

  const map = L.map('map').setView([50.0755, 14.4378], 13); // Praha
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  return map;
}

// Inicializace mapy
const map = initializeMap();
if (!map) {
  alert('Chyba: Mapa nebyla inicializována. Zkontrolujte HTML a CSS.');
}

let currentPolyline = null;
let currentMarker = null;
let routeData = [];
let isDrawing = false;
let isPlacingPin = false;

// Funkce pro mazání mapy
function clearMap() {
  if (!map) return;
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  routeData = [];
}

// Funkce pro přidání bodu
function placePin() {
  if (!map) return;
  clearMap();
  isPlacingPin = true;

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [60, 60],
      }),
    }).addTo(map);
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

// Funkce pro kreslení trasy
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

// Přidání event listenerů
document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('resetMap').addEventListener('click', clearMap);
