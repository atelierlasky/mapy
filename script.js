// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13); // Praha jako výchozí bod
let markers = [];
let currentRoute = null;
let addingMarker = false;

// Světlý a tmavý motiv mapy
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Špendlík ve tvaru vyplněného srdce
const heartIcon = L.divIcon({
  className: 'material-symbols-outlined',
  html: 'favorite',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
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
  markers.forEach(marker => marker.addTo(map));
  if (currentRoute) currentRoute.addTo(map);
});

// Přidání špendlíku na kliknutí na mapu
document.getElementById('addMarker').addEventListener('click', () => {
  addingMarker = true;
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
});

map.on('click', (e) => {
  if (!addingMarker) return;

  const marker = L.marker(e.latlng, { icon: heartIcon }).addTo(map);
  markers.push(marker);
  addingMarker = false;
});

// Přidání trasy spojující všechny špendlíky
document.getElementById('addRoute').addEventListener('click', () => {
  if (markers.length < 2) {
    alert('Pro vytvoření trasy je potřeba alespoň 2 špendlíky.');
    return;
  }
  if (currentRoute) map.removeLayer(currentRoute);
  currentRoute = L.polyline(markers.map(marker => marker.getLatLng()), { color: '#df1674' }).addTo(map);
});

// Uložení mapy jako PDF
document.getElementById('saveMap').addEventListener('click', () => {
  const canvas = document.querySelector('#map canvas');
  if (!canvas) {
    alert('Mapa není připravena.');
    return;
  }

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('portrait', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 120);
  pdf.save('mapa-vzpominek.pdf');
});

// Aktualizace dynamického textového překryvu
function updateOverlayText() {
  const text = document.getElementById('mapText').value || 'Nadpis';
  const dateInput = document.getElementById('mapDate').value || '';
  const date = dateInput ? formatDate(dateInput) : 'Podnadpis';
  document.getElementById('overlayText').innerHTML = `
    <div class="title">${text}</div>
    <div class="date">${date}</div>
  `;
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${parseInt(day)}. ${parseInt(month)}. ${year}`;
}

document.getElementById('mapText').addEventListener('input', updateOverlayText);
document.getElementById('mapDate').addEventListener('input', updateOverlayText);
