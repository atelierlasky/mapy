// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13);

// Přidání dlaždicové vrstvy
const lightTheme = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const darkTheme = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors'
});

// Výchozí režim na umístění špendlíku
setPlacePinMode();

// Nastavení kurzoru
function setCursor(cursorClass) {
  const container = map.getContainer();
  container.classList.remove('crosshair-cursor', 'default-cursor');
  container.classList.add(cursorClass);
}

// Režim umístění špendlíku
function setPlacePinMode() {
  setCursor('crosshair-cursor');
  map.once('click', (e) => {
    L.marker(e.latlng, {
      icon: L.divIcon({
        className: 'heart-icon',
        html: '&#x2764;',
        iconSize: [32, 32]
      })
    }).addTo(map);
    setCursor('default-cursor');
  });
}

// Tlačítko pro výběr bodu
document.getElementById('placePin').addEventListener('click', setPlacePinMode);

// Přepínání motivů
document.getElementById('toggleTheme').addEventListener('click', () => {
  if (map.hasLayer(lightTheme)) {
    map.removeLayer(lightTheme);
    darkTheme.addTo(map);
  } else {
    map.removeLayer(darkTheme);
    lightTheme.addTo(map);
  }
});

// Resetování mapy
document.getElementById('resetMap').addEventListener('click', () => {
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });
});
