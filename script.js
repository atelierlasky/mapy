// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13); // Praha jako výchozí bod
let markers = [];
let currentRoute = null;
let isDarkTheme = false;

const lightTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

lightTiles.addTo(map);

// Ikona špendlíku ve tvaru srdce
const heartIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Heart_coraz%C3%B3n.svg/32px-Heart_coraz%C3%B3n.svg.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Přepínání mezi světlým a tmavým motivem
document.getElementById('toggleTheme').addEventListener('click', () => {
  isDarkTheme = !isDarkTheme;
  map.eachLayer(layer => map.removeLayer(layer));
  isDarkTheme ? darkTiles.addTo(map) : lightTiles.addTo(map);
  markers.forEach(marker => marker.addTo(map));
  if (currentRoute) currentRoute.addTo(map);
});

// Přidání špendlíku na kliknutí na mapu
let addingMarker = false;

document.getElementById('addMarker').addEventListener('click', () => {
  addingMarker = true;
  alert('Klikněte na mapu, kam chcete umístit špendlík.');
});

map.on('click', (e) => {
  if (!addingMarker) return;

  const text = document.getElementById('mapText').value;
  const date = document.getElementById('mapDate').value;

  if (!text || !date) {
    alert('Vyplňte text a datum před přidáním špendlíku!');
    return;
  }

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

// Přidání trasy
document.getElementById('addRoute').addEventListener('click', () => {
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }
  currentRoute = L.polyline(markers.map(marker => marker.getLatLng()), { color: '#df1674' }).addTo(map);
});

// Uložení mapy jako PDF
document.getElementById('saveMap').addEventListener('click', () => {
  const canvas = document.querySelector('#map canvas');
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('portrait', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 120);
  pdf.save('mapa-vzpominek.pdf');
});
