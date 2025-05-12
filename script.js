const map = L.map('map', {
  zoomControl: false,
}).setView([50.0755, 14.4378], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

let currentPolyline = null;
let currentMarker = null;
let routeData = [];
let isDrawing = false;
let isPlacingPin = false;

// Funkce pro vymazání mapy
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
  clearMap();
  isPlacingPin = true;
  isDrawing = false;

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [50, 50],
      }),
    }).addTo(map);
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

// Funkce pro kreslení trasy
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
          iconSize: [50, 50],
        }),
      }).addTo(map);
    }
    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

// Generování odkazu na mapu
function generateMapURL() {
  const baseURL = 'https://atelierlasky.github.io/mapy/';
  const jsonString = encodeURIComponent(JSON.stringify(routeData));
  return `${baseURL}?data=${jsonString}`;
}

// Validace formuláře
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

// Přidání dat do formuláře před odesláním
document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  // Převod dat do JSON
  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapURLField = document.getElementById('mapImageUrl'); // Použití pole pro URL

  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // Uložení JSON kódu
  jsonCodeField.value = jsonData; // Uložení JSON kódu
  mapURLField.value = generateMapURL(); // Vygenerování odkazu na dynamickou mapu
});

// Přidání event listenerů na tlačítka
document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('resetMap').addEventListener('click', clearMap);
