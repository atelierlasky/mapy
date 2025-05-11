// Initialize map
const map = L.map('map').setView([50.0755, 14.4378], 13);
let currentPolyline = null;
let drawing = false;

// Map themes
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Toggle map theme
document.getElementById('toggleTheme').addEventListener('click', () => {
  const isDarkTheme = map.hasLayer(lightTiles);
  map.eachLayer(layer => map.removeLayer(layer));
  if (isDarkTheme) {
    darkTiles.addTo(map);
  } else {
    lightTiles.addTo(map);
  }
});

// Heart-shaped pin icon
const heartIcon = L.divIcon({
  className: 'material-symbols-outlined',
  html: 'favorite',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Place Pin functionality
document.getElementById('placePin').addEventListener('click', () => {
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
  map.once('click', (e) => {
    L.marker(e.latlng, { icon: heartIcon }).addTo(map);
  });
});

// Draw Route functionality
document.getElementById('startDrawing').addEventListener('click', () => {
  drawing = true;
  document.getElementById('stopDrawing').style.display = 'inline-block';

  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }

  currentPolyline = L.polyline([], { color: '#df1674', weight: 4 }).addTo(map);

  map.on('click', addPointToPolyline);
});

document.getElementById('stopDrawing').addEventListener('click', () => {
  drawing = false;
  map.off('click', addPointToPolyline);
  document.getElementById('stopDrawing').style.display = 'none';
});

function addPointToPolyline(e) {
  if (!drawing || !currentPolyline) return;

  if (currentPolyline.getLatLngs().length === 0) {
    L.marker(e.latlng, { icon: heartIcon }).addTo(map); // First point gets a heart pin
  }
  currentPolyline.addLatLng(e.latlng);
}

// Save map and send email
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
    .send('your_service_id', 'your_template_id', {
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
