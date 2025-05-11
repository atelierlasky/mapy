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

// Vybrat bod
document.getElementById('placePin').addEventListener('click', () => {
  if (drawing) reset();
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
  map.once('click', (e) => {
    L.marker(e.latlng, { icon: L.divIcon({ className: 'heart-icon', html: '&#x2764;', iconSize: [32, 32] }) }).addTo(map);
    pinPlaced = true;
  });
});

// Nakreslit trasu
document.getElementById('startDrawing').addEventListener('click', () => {
  if (pinPlaced) reset();
  drawing = true;
  document.getElementById('stopDrawing').style.display = 'inline-block';
  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);
  map.on('click', (e) => currentPolyline.addLatLng(e.latlng));
});

document.getElementById('stopDrawing').addEventListener('click', () => {
  drawing = false;
  map.off('click');
  document.getElementById('stopDrawing').style.display = 'none';
});

// Synchronizace nadpisu a datumu
document.getElementById('mapText').addEventListener('input', (e) => {
  document.querySelector('.overlay-text .title').textContent = e.target.value || 'Nadpis';
});
document.getElementById('mapDate').addEventListener('input', (e) => {
  const date = formatDate(e.target.value);
  document.querySelector('.overlay-text .date').textContent = date || 'Datum';
});

// Formátování datumu
function formatDate(date) {
  const [year, month, day] = date.split('-');
  return `${parseInt(day)}. ${parseInt(month)}. ${year}`;
}

// Před odesláním formuláře uložit trasu
document.getElementById('mapForm').addEventListener('submit', (e) => {
  if (currentPolyline) {
    const route = currentPolyline.toGeoJSON();
    document.getElementById('mapRoute').value = JSON.stringify(route);
  }
  alert('Mapa byla úspěšně odeslána k nám. Nyní si ji přidejte do košíku a vyberte provedení, které se vám líbí.');
});

// Reset funkce
function reset() {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
  drawing = false;
  pinPlaced = false;
  currentPolyline = null;
}
