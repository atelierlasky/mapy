const map = L.map('map').setView([50.0755, 14.4378], 13);
let drawing = false;
let currentPolyline = null;

// Map Themes
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png');

// Toggle Theme
document.getElementById('toggleTheme').addEventListener('click', () => {
  map.eachLayer(layer => map.removeLayer(layer));
  map.hasLayer(lightTiles) ? darkTiles.addTo(map) : lightTiles.addTo(map);
});

// Place Pin
document.getElementById('placePin').addEventListener('click', () => {
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
  map.once('click', (e) => {
    L.marker(e.latlng).addTo(map);
  });
});

// Draw Route
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

// Sync Inputs with Overlay
document.getElementById('mapText').addEventListener('input', (e) => {
  document.querySelector('.overlay-text .title').textContent = e.target.value || 'Nadpis';
});
document.getElementById('mapDate').addEventListener('input', (e) => {
  document.querySelector('.overlay-text .date').textContent = e.target.value || 'Datum';
});

// Save and Email
document.getElementById('saveMap').addEventListener('click', async () => {
  const email = document.getElementById('userEmail').value;
  if (!email) return alert('Zadejte platný e-mail.');
  const data = {
    title: document.getElementById('mapText').value || 'Nadpis',
    date: document.getElementById('mapDate').value || 'Datum',
    route: currentPolyline ? currentPolyline.toGeoJSON() : null,
  };
  try {
    await axios.post('https://jsonplaceholder.typicode.com/posts', data);
    alert('Data odeslána.');
  } catch {
    alert('Chyba při odesílání dat.');
  }
});
