// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13); // Praha jako výchozí bod
let currentPolyline = null;
let drawing = false;

// Světlý a tmavý motiv mapy
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Přepínání mezi světlým a tmavým motivem
document.getElementById('toggleTheme').addEventListener('click', () => {
  const isDarkTheme = map.hasLayer(lightTiles);
  map.eachLayer(layer => map.removeLayer(layer));
  if (isDarkTheme) {
    darkTiles.addTo(map);
  } else {
    lightTiles.addTo(map);
  }
});

// Kreslení trasy
document.getElementById('startDrawing').addEventListener('click', () => {
  drawing = true;
  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }
  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', addPointToPolyline);
});

document.getElementById('stopDrawing').addEventListener('click', () => {
  drawing = false;
  map.off('click', addPointToPolyline);
});

function addPointToPolyline(e) {
  if (!drawing || !currentPolyline) return;
  currentPolyline.addLatLng(e.latlng);
}

// Resetování mapy
document.getElementById('resetMap').addEventListener('click', () => {
  if (currentPolyline) {
    map.removeLayer(currentPolyline);
    currentPolyline = null;
  }
  drawing = false;
});

// Uložení mapy jako JSON a odeslání emailu
document.getElementById('saveMap').addEventListener('click', () => {
  const email = document.getElementById('userEmail').value;
  const text = document.getElementById('mapText').value || 'Bez textu';
  const dateInput = document.getElementById('mapDate').value || '';
  const date = dateInput ? formatDate(dateInput) : 'Bez datumu';

  if (!email) {
    alert('Zadejte prosím platný e-mail.');
    return;
  }

  const geojson = currentPolyline ? currentPolyline.toGeoJSON() : null;

  const data = {
    text: text,
    date: date,
    geojson: geojson
  };

  emailjs
    .send('service_id', 'template_id', {
      to_email: email,
      message: JSON.stringify(data, null, 2)
    })
    .then(() => {
      alert('E-mail byl úspěšně odeslán.');
    })
    .catch(error => {
      console.error('Chyba při odesílání e-mailu:', error);
      alert('Nastala chyba při odesílání e-mailu.');
    });
});

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${parseInt(day)}. ${parseInt(month)}. ${year}`;
}
