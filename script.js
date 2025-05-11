// Initialize the map
const map = L.map('map').setView([50.0755, 14.4378], 13); // Prague as the starting point
let markers = [];
let currentRoute = null;
let addingMarker = false;

// Tile layers for light and dark themes
const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Heart icon for the marker
const heartIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Heart_coraz%C3%B3n.svg/32px-Heart_coraz%C3%B3n.svg.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Toggle between light and dark themes
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

// Add a pin on map click
document.getElementById('addMarker').addEventListener('click', () => {
  addingMarker = true;
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
});

map.on('click', (e) => {
  if (!addingMarker) return;

  const text = document.getElementById('mapText').value || 'Bez textu';
  const date = document.getElementById('mapDate').value || 'Datum neuvedeno';

  const marker = L.marker(e.latlng, { icon: heartIcon }).addTo(map);
  marker.bindPopup(`
    <div class="marker-popup">
      <div class="title">${text}</div>
      <div class="date">${date}</div>
    </div>
  `).openPopup();
  markers.push(marker);
  addingMarker = false;
});

// Add a route connecting all markers
document.getElementById('addRoute').addEventListener('click', () => {
  if (markers.length < 2) {
    alert('Pro vytvoření trasy je potřeba alespoň 2 špendlíky.');
    return;
  }
  if (currentRoute) map.removeLayer(currentRoute);
  currentRoute = L.polyline(markers.map(marker => marker.getLatLng()), { color: '#df1674' }).addTo(map);
});

// Save the map as a PDF
document.getElementById('saveMap').addEventListener('click', () => {
  const canvas = document.querySelector('#map canvas');
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('portrait', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 120);
  pdf.save('mapa-vzpominek.pdf');
});

// Update dynamic text overlay
function updateOverlayText() {
  const text = document.getElementById('mapText').value || 'Nadpis';
  const date = document.getElementById('mapDate').value || 'Podnadpis';
  document.getElementById('overlayText').innerHTML = `
    <div class="title">${text}</div>
    <div class="date">${date}</div>
  `;
}

document.getElementById('mapText').addEventListener('input', updateOverlayText);
document.getElementById('mapDate').addEventListener('input', updateOverlayText);
