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

// Automatické propisování nadpisu a datumu
document.getElementById('mapText').addEventListener('input', (e) => {
  document.getElementById('mapTitle').textContent = e.target.value || 'Vaše vzpomínka';
});

document.getElementById('mapDate').addEventListener('input', (e) => {
  document.getElementById('mapDateDisplay').textContent = `Datum: ${e.target.value}`;
});

// Funkce pro nastavení kurzoru
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Výběr bodu
document.getElementById('placePin').addEventListener('click', () => {
  setCursor('crosshair-cursor');
  map.once('click', (e) => {
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [60, 60] // Zvýšení velikosti srdce
      })
    }).addTo(map);
    setCursor('default-cursor');
  });
});

// Kreslení trasy
document.getElementById('startDrawing').addEventListener('click', () => {
  setCursor('crosshair-cursor');
  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', (e) => {
    currentPolyline.addLatLng(e.latlng);
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
  });
});

// Reset mapy
document.getElementById('resetMap').addEventListener('click', () => {
  routeData = [];
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  setCursor('default-cursor');
});
