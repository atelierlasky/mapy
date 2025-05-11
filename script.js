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
let currentPolyline = null;
let currentMarker = null;
let routeData = []; // Data pro trasu a body
let isDrawing = false;
let isPlacingPin = false;

// Funkce pro nastavení kurzoru
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Funkce pro mazání vrstev
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

// Funkce pro přidání bodu
function placePin() {
  if (isDrawing) clearMap();
  isPlacingPin = true;
  isDrawing = false;
  setCursor('crosshair-cursor');

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [60, 60],
      }),
    }).addTo(map);
    routeData = [{ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng }];
    setCursor('default-cursor');
  });
}

// Funkce pro kreslení trasy
function drawRoute() {
  if (isPlacingPin) clearMap();
  isDrawing = true;
  isPlacingPin = false;
  setCursor('crosshair-cursor');

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    if (routeData.length === 0) {
      currentMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'heart-icon',
          html: '&#x2764;',
          iconSize: [60, 60],
        }),
      }).addTo(map);
    }

    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

// Validace formuláře
function validateForm(event) {
  if (routeData.length === 0) {
    alert('Mapa musí obsahovat alespoň 1 bod nebo trasu! Kontaktujte nás na Ateliér lásky.');
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

// Generování URL editoru mapy
function generateEditorURL() {
  const baseURL = 'https://www.mapeditor.com/editor';
  const coordinates = routeData.map((point) => `${point.lng},${point.lat}`).join(';');
  return `${baseURL}?coordinates=${encodeURIComponent(coordinates)}`;
}

// Přidání dat do formuláře před odesláním
document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');
  const editorURLField = document.createElement('input');

  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData;
  jsonCodeField.value = jsonData;

  const mapImageURL = `https://staticmap.example.com?data=${encodeURIComponent(jsonData)}`;
  mapImageField.value = mapImageURL;

  const editorURL = generateEditorURL();
  editorURLField.type = 'hidden';
  editorURLField.name = 'editor_url';
  editorURLField.value = editorURL;
  document.getElementById('mapForm').appendChild(editorURLField);
});

// Přidání event listenerů na tlačítka
document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('resetMap').addEventListener('click', clearMap);
