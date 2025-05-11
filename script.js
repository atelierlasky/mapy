// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13);
let currentPolyline = null;
let routeData = []; // Pole pro uložení souřadnic trasy a špendlíku

// Přidání mapových vrstev (světlý a tmavý motiv)
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Funkce pro vykreslení trasy a bodů na mapu
function drawRouteAndPins() {
  // Vymazání staré trasy
  if (currentPolyline) {
    map.removeLayer(currentPolyline);
  }

  // Vykreslení trasy
  const routePoints = routeData
    .filter((point) => point.type === 'route')
    .map((point) => [point.lat, point.lng]);

  if (routePoints.length > 0) {
    currentPolyline = L.polyline(routePoints, { color: '#df1674', weight: 4 }).addTo(map);
  }

  // Vykreslení špendlíku
  routeData
    .filter((point) => point.type === 'pin')
    .forEach((pin) => {
      L.marker([pin.lat, pin.lng], {
        icon: L.divIcon({
          className: 'heart-icon',
          html: '&#x2764;',
          iconSize: [40, 40]
        })
      }).addTo(map);
    });
}

// Funkce pro export mapy jako SVG
function exportMapAsSVG() {
  const svgElement = map.getContainer().querySelector('svg'); // Najdeme SVG element mapy
  const serializer = new XMLSerializer();
  const svgContent = serializer.serializeToString(svgElement);

  // Vytvoříme blob a URL ke stažení
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  return url; // Vrací URL ke stažení SVG
}

// Funkce pro přidání odkazu SVG do formuláře
function addSVGToForm() {
  const svgURL = exportMapAsSVG();
  const svgField = document.createElement('input');
  svgField.type = 'hidden';
  svgField.name = 'svg_map_url';
  svgField.value = svgURL;

  // Přidáme pole do formuláře
  document.getElementById('mapForm').appendChild(svgField);
}

// Před odesláním formuláře přidáme SVG mapu a trasu do skrytých polí
document.getElementById('mapForm').addEventListener('submit', (event) => {
  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');

  // Generování JSON dat
  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // Pro pole route
  jsonCodeField.value = jsonData; // Pro pole json_code

  // Přidání SVG mapy do formuláře
  addSVGToForm();
});

// Ostatní funkce pro výběr bodů, kreslení trasy a přepínání motivů
document.getElementById('placePin').addEventListener('click', () => {
  map.once('click', (e) => {
    routeData.push({ type: 'pin', lat: e.latlng.lat, lng: e.latlng.lng });
    drawRouteAndPins(); // Aktualizace vykreslení mapy
  });
});

document.getElementById('startDrawing').addEventListener('click', () => {
  map.on('click', (e) => {
    routeData.push({ type: 'route', lat: e.latlng.lat, lng: e.latlng.lng });
    drawRouteAndPins(); // Aktualizace vykreslení mapy
  });
});

document.getElementById('resetMap').addEventListener('click', () => {
  routeData = [];
  drawRouteAndPins();
});
