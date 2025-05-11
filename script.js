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

// Přidání špendlíku
document.getElementById('addMarker').addEventListener('click', () => {
  const text = document.getElementById('mapText').value;
  const date = document.getElementById('mapDate').value;

  if (!text || !date) {
    alert('Vyplňte text a datum!');
    return;
  }

  const marker = L.marker(map.getCenter(), { icon: heartIcon }).addTo(map);
  marker.bindPopup(`<div class="marker-text">${text}</div><div class="marker-date">${date}</div>`).openPopup();
  markers.push(marker);
});

// Přidání trasy
document.getElementById('addRoute').addEventListener('click', () => {
  if (currentRoute) {
    map.removeLayer(currentRoute);
  }
  currentRoute = L.polyline(markers.map(marker => marker.getLatLng()), { color: '#df1674' }).addTo(map);
});

// Zpět (odstraní poslední bod)
document.getElementById('undoLastPoint').addEventListener('click', () => {
  if (markers.length > 0) {
    const lastMarker = markers.pop();
    map.removeLayer(lastMarker);

    if (currentRoute) {
      map.removeLayer(currentRoute);
      currentRoute = L.polyline(markers.map(marker => marker.getLatLng()), { color: '#df1674' }).addTo(map);
    }
  } else {
    alert('Žádné body k odstranění!');
  }
});

// Vymazání mapy
document.getElementById('resetMap').addEventListener('click', () => {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  if (currentRoute) {
    map.removeLayer(currentRoute);
    currentRoute = null;
  }
});

// Odeslání mapy a generování PDF
document.getElementById('sendMap').addEventListener('click', () => {
  const email = document.getElementById('userEmail').value;

  if (!email) {
    alert('Zadejte platný e-mail!');
    return;
  }

  const canvas = document.querySelector('#map canvas');
  const imgData = canvas.toDataURL('image/png');

  const pdf = new jsPDF('portrait', 'mm', 'a4');
  pdf.addImage(imgData, 'PNG', 10, 10, 190, 120);
  pdf.text(`E-mail klienta: ${email}`, 10, 140);

  const pdfData = pdf.output('datauristring');

  // Odeslání e-mailu přes EmailJS
  emailjs.send('wes1-smtp.wedos.net', 'template_mrwvhrm', {
    to_email: 'mapa@atelierlasky.cz',
    user_email: email,
    attachment: pdfData,
  }).then(() => {
    alert('Mapa byla úspěšně odeslána!');
  }).catch(error => {
    console.error('Chyba při odesílání e-mailu:', error);
    alert('Došlo k chybě při odesílání e-mailu.');
  });
});
