// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13);
let drawing = false;
let currentPolyline = null;

// Světlý a tmavý motiv mapy
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');

// Přepínání motivu mapy
document.getElementById('toggleTheme').addEventListener('click', () => {
  map.eachLayer(layer => map.removeLayer(layer));
  map.hasLayer(lightTiles) ? darkTiles.addTo(map) : lightTiles.addTo(map);
});

// Umístit špendlík
document.getElementById('placePin').addEventListener('click', () => {
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
  map.once('click', (e) => {
    L.marker(e.latlng).addTo(map);
  });
});

// Kreslení trasy
document.getElementById('startDrawing').addEventListener('click', () => {
  drawing = true;
  document.getElementById('stopDrawing').style.display = 'inline-block';
  currentPolyline = L.polyline([], { color: '#df1674' }).addTo(map);
  map.on('click', (e) => currentPolyline.addLatLng(e.latlng));
});

document.getElementById('stopDrawing').addEventListener('click', () => {
  drawing = false;
  map.off('click');
  document.getElementById('stopDrawing').style.display = 'none';
});

// Synchronizace textu s formulářem
document.getElementById('mapText').addEventListener('input', (e) => {
  document.querySelector('.overlay-text .title').textContent = e.target.value || 'Nadpis';
});
document.getElementById('mapDate').addEventListener('input', (e) => {
  document.querySelector('.overlay-text .date').textContent = e.target.value || 'Datum';
});

// Před odesláním formuláře uložit trasu
document.getElementById('mapForm').addEventListener('submit', (e) => {
  if (currentPolyline) {
    const route = currentPolyline.toGeoJSON();
    document.getElementById('mapRoute').value = JSON.stringify(route);
  }
  alert('Mapa byla úspěšně odeslána k nám. Nyní si ji přidejte do košíku a vyberte provedení, které se vám líbí.');
});
