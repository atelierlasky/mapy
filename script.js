const map = L.map('map', {
  zoomControl: false, // Odstranění zoomovacích tlačítek
}).setView([50.0755, 14.4378], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let currentPolyline = null;
let currentMarker = null;
let routeData = [];
let isDrawing = false;
let isPlacingPin = false;

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

function placePin() {
  clearMap();
  isPlacingPin = true;
  isDrawing = false;

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [50, 50], // Velikost srdíčka
      }),
    }).addTo(map);
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

function drawRoute() {
  clearMap();
  isDrawing = true;
  isPlacingPin = false;

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    if (currentPolyline.getLatLngs().length === 0) {
      // Přidání srdíčka na první bod
      L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'heart-icon',
          html: '&#x2764;',
          iconSize: [50, 50], // Velikost srdíčka
        }),
      }).addTo(map);
    }
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

document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('resetMap').addEventListener('click', clearMap);

document.getElementById('mapForm').addEventListener('submit', (event) => {
  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');

  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData;
  jsonCodeField.value = jsonData;
});
