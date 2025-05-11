// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13);
let currentPolyline = null;
let routeData = []; // Pole pro uložení souřadnic trasy a špendlíku

// Přidání mapových vrstev (světlý a tmavý motiv)
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Zobrazení aktuálního data v českém formátu
const currentDate = new Date().toLocaleDateString('cs-CZ');
document.getElementById('currentDate').textContent = currentDate;

// Funkce pro nastavení kurzoru
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Funkce pro nastavení režimu umístění špendlíku
function setPlacePinMode() {
  setCursor('crosshair-cursor');
  map.once('click', (e) => {
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;', // Růžové srdce
        iconSize: [40, 40] // Zvýšení velikosti srdce
      })
    }).addTo(map);

    // Přidání špendlíku do routeData
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
    setCursor('default-cursor');
  });
}

// Funkce pro začátek kreslení trasy
function startDrawing() {
  setCursor('crosshair-cursor');
  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
  });
}

// Funkce pro zastavení kreslení trasy
function stopDrawing() {
  map.off('click');
  setCursor('default-cursor');
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

// Funkce pro resetování mapy
function resetMap() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  routeData = []; // Vymazání dat trasy a špendlíku
  if (currentPolyline) {
    currentPolyline = null;
  }
}

// Před odesláním formuláře přidáme trasu a kompletní JSON kód do skrytých polí
document.getElementById('mapForm').addEventListener('submit', (event) => {
  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');

  // Uložení dat trasy a špendlíku jako JSON
  const jsonData = JSON.stringify(routeData, null, 2); // Formátovaný JSON
  routeField.value = jsonData; // Pro pole route
  jsonCodeField.value = jsonData; // Pro pole json_code (kompletní JSON kód)
});

// Nastavení tlačítek a akcí
document.getElementById('placePin').addEventListener('click', setPlacePinMode);
document.getElementById('startDrawing').addEventListener('click', startDrawing);
document.getElementById('resetMap').addEventListener('click', resetMap);
document.getElementById('toggleTheme').addEventListener('click', toggleTheme);
