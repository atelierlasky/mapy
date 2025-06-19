// GLOBALS
let map;
let marker = null;
let lastLatLng = null;

// 1. Inicializace mapy
window.addEventListener('DOMContentLoaded', function() {
  map = L.map('leaflet-map', {
    zoomControl: false, // vlastní zoom tlačítka
    attributionControl: false
  }).setView([50.0755, 14.4378], 13); // výchozí Praha

  // Snížený, světlý styl OSM (nejblíže Colliers Light 2021)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  // Vlastní zoom tlačítka
  document.getElementById('zoom-in').onclick = () => map.zoomIn();
  document.getElementById('zoom-out').onclick = () => map.zoomOut();

  // Kliknutí na mapu: umísti/posuň špendlík
  map.on('click', function(e) {
    placePin(e.latlng);
  });

  // Ukládací dialog
  document.getElementById('save-btn').onclick = showSaveDialog;

  // Dialog ovládání
  document.getElementById('dialog-yes').onclick = showFinalDialog;
  document.getElementById('dialog-no').onclick = closeDialog;
  document.getElementById('copy-btn').onclick = function() {
    const gps = document.getElementById('final-gps').textContent;
    navigator.clipboard.writeText(gps).then(() => {
      document.getElementById('copy-btn').textContent = "ZKOPÍROVÁNO!";
      setTimeout(() => { document.getElementById('copy-btn').textContent = "KOPÍROVAT"; }, 1200);
    });
  };

  // Vyhledávací pole
  setupSearchAutocomplete();
});

// 2. Pin s Material Symbol
function getCustomIcon() {
  return L.divIcon({
    className: 'map-pin',
    html: `<span class="material-symbols-outlined">favorite</span>`,
    iconSize: [48, 48],
    iconAnchor: [24, 44],
    popupAnchor: [0, -44]
  });
}

function placePin(latlng) {
  lastLatLng = latlng;
  if (!marker) {
    marker = L.marker(latlng, {
      icon: getCustomIcon(),
      draggable: true
    }).addTo(map);
    marker.on('dragend', function(e) {
      lastLatLng = marker.getLatLng();
    });
  } else {
    marker.setLatLng(latlng);
  }
  map.panTo(latlng);
}

// 3. Ovládání dialogu
function showSaveDialog() {
  if (!lastLatLng) return alert("Nejprve označte místo na mapě.");
  document.getElementById('dialog-gps').textContent = `${lastLatLng.lat.toFixed(7)}, ${lastLatLng.lng.toFixed(7)}`;
  document.getElementById('map-dialog-backdrop').style.display = 'flex';
  document.getElementById('dialog-step1').style.display = '';
  document.getElementById('dialog-step2').style.display = 'none';
}

function closeDialog() {
  document.getElementById('map-dialog-backdrop').style.display = 'none';
}
function showFinalDialog() {
  document.getElementById('dialog-step1').style.display = 'none';
  document.getElementById('dialog-step2').style.display = '';
  document.getElementById('final-gps').textContent = `${lastLatLng.lat.toFixed(7)}, ${lastLatLng.lng.toFixed(7)}`;
}

// 4. Vyhledávání a autocomplete s Nominatim OSM
function setupSearchAutocomplete() {
  const input = document.getElementById('searchBox');
  const dropdown = document.getElementById('autocomplete');
  let timer = null;
  let selected = -1;
  let results = [];

  input.addEventListener('input', function() {
    const q = input.value.trim();
    if (timer) clearTimeout(timer);
    if (q.length < 3) {
      dropdown.style.display = 'none';
      return;
    }
    timer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=6`)
        .then(r => r.json())
        .then(data => {
          results = data;
          if (data.length === 0) {
            dropdown.innerHTML = '<div class="map-autocomplete-item">Nenalezeno…</div>';
            dropdown.style.display = 'block';
            selected = -1;
            return;
          }
          dropdown.innerHTML = data.map((item, idx) =>
            `<div class="map-autocomplete-item${idx === selected ? ' selected' : ''}" data-idx="${idx}">
              ${item.display_name}
            </div>`
          ).join('');
          dropdown.style.display = 'block';
          selected = -1;
        });
    }, 320);
  });

  input.addEventListener('keydown', function(e) {
    if (dropdown.style.display !== 'block') return;
    if (e.key === 'ArrowDown') {
      selected = Math.min(selected + 1, results.length - 1);
      updateDropdownSelection();
      e.preventDefault();
    } else if (e.key === 'ArrowUp') {
      selected = Math.max(selected - 1, 0);
      updateDropdownSelection();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      if (selected >= 0 && results[selected]) {
        chooseResult(selected);
        e.preventDefault();
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
    }
  });

  dropdown.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('map-autocomplete-item')) {
      const idx = parseInt(e.target.getAttribute('data-idx'), 10);
      if (!isNaN(idx)) chooseResult(idx);
    }
  });

  function updateDropdownSelection() {
    Array.from(dropdown.children).forEach((el, idx) => {
      if (idx === selected) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  }

  function chooseResult(idx) {
    const item = results[idx];
    input.value = item.display_name;
    dropdown.style.display = 'none';
    const latlng = L.latLng(parseFloat(item.lat), parseFloat(item.lon));
    placePin(latlng);
    map.setView(latlng, 16);
  }

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}
