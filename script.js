// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13);
let drawing = false;
let pinPlaced = false;
let currentPolyline = null;

// Světlé a tmavé motivy
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Nastavení výchozího režimu na umístění špendlíku
setPlacePinMode();

// Přidání kurzoru mapě
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Výběr bodu (srdíčko) s výchozím režimem
function setPlacePinMode() {
  reset(); // Zruší případné kreslení
  setCursor('crosshair-cursor');
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
  map.once('click', (e) => {
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;', // Růžové srdíčko
        iconSize: [32, 32]
      })
    }).addTo(map);
    pinPlaced = true;
    setCursor('default-cursor'); // Vrátí defaultní kurzor
  });
}

// Tlačítko pro režim umístění špendlíku
document.getElementById('placePin').addEventListener('click', () => {
  setPlacePinMode();
});

// Kreslení trasy
document.getElementById('startDrawing').addEventListener('click', () => {
  if (pinPlaced) reset(); // Zruší špendlík, pokud byl umístěn
  drawing = true;
  setCursor('crosshair-cursor'); // Nastaví kurzor na crosshair
  document.getElementById('stopDrawing').style.display = 'inline-block';
  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);
  map.on('click', (e) => currentPolyline.addLatLng(e.latlng));
});

// Zastavení kreslení trasy
document.getElementById('stopDrawing').addEventListener('click', () => {
  drawing = false;
  map.off('click');
  setCursor('default-cursor'); // Vrátí defaultní kurzor
  document.getElementById('stopDrawing').style.display = 'none';
});

// Přepínání motivů
document.getElementById('toggleTheme').addEventListener('click', () => {
  if (map.hasLayer(lightTheme)) {
    map.removeLayer(lightTheme);
    darkTheme.addTo(map);
    document.getElementById('colorScheme').value = 'Tmavé';
  } else {
    map.removeLayer(darkTheme);
    lightTheme.addTo(map);
    document.getElementById('colorScheme').value = 'Světlé';
  }
});

// Resetování mapy
function reset() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  drawing = false;
  pinPlaced = false;
  currentPolyline = null;
  setCursor('default-cursor'); // Vrátí defaultní kurzor
}
