// Inicializace mapy
const map = L.map('map', {
  zoomControl: false, // Skryjeme původní zoomovací ovládání, upravíme ho později
}).setView([50.0755, 14.4378], 13);
let currentPolyline = null;
let currentMarker = null;
let routeData = []; // Pole pro uložení souřadnic trasy a špendlíku
let isDrawing = false; // Stav, zda uživatel kreslí trasu
let isPlacingPin = false; // Stav, zda uživatel umísťuje špendlík

// Přidání mapových vrstev (světlý a tmavý motiv)
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors',
});

// Přidání vlastního zoomovacího ovládání
L.control.zoom({
  position: 'topleft', // Posuneme zoomovací tlačítka do levé strany
}).addTo(map);

// Automatické propisování nadpisu a textu
document.getElementById('mapText').addEventListener('input', (e) => {
  document.getElementById('mapTitle').textContent = e.target.value || 'Vaše vzpomínka';
});

document.getElementById('mapCustomText').addEventListener('input', (e) => {
  document.getElementById('mapTextDisplay').textContent = e.target.value || 'Váš text';
});

// Funkce pro nastavení kurzoru
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Funkce pro mazání všech vrstev
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

// Funkce pro přidání špendlíku
function placePin() {
  clearMap(); // Smažeme všechny vrstvy, pokud už něco existuje
  isPlacingPin = true;
  isDrawing = false;
  setCursor('crosshair-cursor');

  map.once('click', (e) => {
    currentMarker = L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;', // Růžové srdce
        iconSize: [60, 60], // Zvýšení velikosti srdce
      }),
    }).addTo(map);

    routeData = [{ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng }]; // Uložíme data špendlíku
    setCursor('default-cursor');
  });
}

// Funkce pro kreslení trasy
function drawRoute() {
  clearMap(); // Smažeme všechny vrstvy, pokud už něco existuje
  isDrawing = true;
  isPlacingPin = false;
  setCursor('crosshair-cursor');

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng }); // Uložíme data trasy
  });
}

// Funkce pro přepínání motivů
function toggleTheme() {
  if (map.hasLayer(lightTheme)) {
    map.removeLayer(lightTheme);
    darkTheme.addTo(map);
  } else {
    map.removeLayer(darkTheme);
    lightTheme.addTo(map);
  }
}

// Funkce pro generování URL statické mapy
function generateMapImageURL() {
  const accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Nahraďte svým Mapbox tokenem
  const baseURL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static';

  // Přidání špendlíku
  const pins = routeData
    .filter((point) => point.type === 'pin')
    .map((pin) => `pin-l-heart+df1674(${pin.lng},${pin.lat})`)
    .join(',');

  // Přidání trasy
  const routePath = routeData
    .filter((point) => point.type === 'route')
    .map((route) => `${route.lng},${route.lat}`)
    .join(';');
  const path = `path-5+df1674-1(${routePath})`;

  // Centrování mapy na první bod
  const center = routeData[0] ? `${routeData[0].lng},${routeData[0].lat}` : '14.4362,50.0780';

  // Velikost mapy a zoom
  const size = '800x400';
  const zoom = 12;

  // Sestavení konečné URL
  return `${baseURL}/${pins},${path}/${center},${zoom}/${size}?access_token=${accessToken}`;
}

// Před odesláním formuláře přidáme data a URL mapy
document.getElementById('mapForm').addEventListener('submit', (event) => {
  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');

  // Generování JSON dat
  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // Pro pole route
  jsonCodeField.value = jsonData; // Pro pole json_code

  // Přidání URL statické mapy
  const mapImageURL = generateMapImageURL();
  mapImageField.value = mapImageURL;
});

// Přidání událostí k tlačítkům
document.getElementById('placePin').addEventListener('click', placePin);
document.getElementById('startDrawing').addEventListener('click', drawRoute);
document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
document.getElementById('resetMap').addEventListener('click', clearMap);
