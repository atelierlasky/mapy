const light = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

const dark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; Stadia Maps'
});

let currentBaseMap = light;
const map = L.map('map', {
  center: [50.0755, 14.4378],
  zoom: 13,
  layers: [currentBaseMap]
});

const drawnItems = L.featureGroup().addTo(map);
let currentMode = null;
let routePoints = [];
const history = [];
let pointMarker = null;

const pinkIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/833/833472.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

let routeLine = null;

function setMode(mode) {
  currentMode = mode;
  if (mode === 'route') routePoints = [];
  document.getElementById('mapNotice').style.display = 'none';
}

function switchBaseMap() {
  map.removeLayer(currentBaseMap);
  currentBaseMap = (currentBaseMap === light) ? dark : light;
  map.addLayer(currentBaseMap);
}

map.on('click', function (e) {
  if (currentMode === 'point') {
    if (pointMarker) drawnItems.removeLayer(pointMarker);
    pointMarker = L.marker(e.latlng, { icon: pinkIcon }).addTo(drawnItems);
  } else if (currentMode === 'route') {
    const marker = L.marker(e.latlng, { icon: pinkIcon }).addTo(drawnItems);
    routePoints.push(e.latlng);
    history.push({ marker });

    if (routeLine) drawnItems.removeLayer(routeLine);
    routeLine = L.polyline(routePoints, { color: '#df1674' }).addTo(drawnItems);
  }
});

document.getElementById('undoButton').addEventListener('click', () => {
  if (currentMode === 'route' && routePoints.length > 0) {
    const last = history.pop();
    drawnItems.removeLayer(last.marker);
    routePoints.pop();
    if (routeLine) {
      drawnItems.removeLayer(routeLine);
      routeLine = routePoints.length > 0 ? L.polyline(routePoints, { color: '#df1674' }).addTo(drawnItems) : null;
    }
  }
});

document.getElementById('resetButton').addEventListener('click', () => {
  drawnItems.clearLayers();
  history.length = 0;
  routePoints = [];
  routeLine = null;
  pointMarker = null;
  document.getElementById('mapNotice').style.display = 'none';
});

document.getElementById('saveButton').addEventListener('click', async () => {
  const email = document.getElementById('emailInput').value;
  if (!email) {
    alert('Prosím zadejte svůj e-mail.');
    return;
  }

  const geojson = drawnItems.toGeoJSON();
  if (geojson.features.length === 0) {
    document.getElementById('mapNotice').style.display = 'block';
    return;
  }

  const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
  const file = new File([blob], "mapa.geojson", { type: "application/json" });

  const formData = new FormData();
  formData.append("_subject", "Nová mapa je připravená!");
  formData.append("email", email);
  formData.append("message", `Nový uživatel vytvořil svou mapu, připrav mu ji!\n\nKontakt: ${email}\n\nData:\n${geojson.features.map(f => JSON.stringify(f.geometry)).join('\n\n')}`);
  formData.append("_next", "https://atelierlasky.cz/dekujeme");

  await fetch("https://formsubmit.co/ajax", {
    method: "POST",
    body: formData,
  });

  alert('Mapa byla úspěšně uložena.');
});
