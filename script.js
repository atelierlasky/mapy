// Inicializace mapy
const map = L.map('map').setView([50.0755, 14.4378], 13); // Praha jako výchozí bod
let markers = [];
let currentRoute = null;

const baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
baseLayer.addTo(map);

// Ikona špendlíku ve tvaru srdce
const heartIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Heart_coraz%C3%B3n.svg/32px-Heart_coraz%C3%B3n.svg.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
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
  marker.bindPopup(`<strong>${text}</strong><br>${date}`).openPopup();
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
  emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
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
