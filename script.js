let map = L.map('map').setView([50.0755, 14.4378], 7); // Praha jako výchozí
let markers = [];
let currentRoute = null;
let baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
baseLayer.addTo(map);

// Růžové srdíčko jako ikona
const heartIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Heart_corazón.svg/32px-Heart_corazón.svg.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function searchLocation() {
  const input = document.getElementById("search-input").value;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const latlng = [data[0].lat, data[0].lon];
        map.setView(latlng, 13);
      }
    });
}

function addMarker() {
  const marker = L.marker(map.getCenter(), { icon: heartIcon }).addTo(map);
  markers.push(marker);
}

function startRoute() {
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }
  currentRoute = L.polyline(markers.map(m => m.getLatLng()), { color: "#d63384" }).addTo(map);
}

function toggleMap() {
  map.removeLayer(baseLayer);
  baseLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png');
  baseLayer.addTo(map);
}

function resetMap() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
}

function sendJson() {
  const body = JSON.stringify(markers.map(m => m.getLatLng()));
  window.location.href = `mailto:info@atelierlasky.cz?subject=Mapa%20vzpominek&body=${encodeURIComponent(body)}`;
}
