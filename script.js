// Funkce pro validaci formuláře
function validateForm(event) {
  if (routeData.length === 0) {
    alert('Ateliér lásky: Mapa musí obsahovat alespoň 1 bod nebo trasu. V případě technických problémů nás kontaktujte: info@atelierlasky.cz');
    event.preventDefault();
    return false;
  }

  // Zkontrolujeme, zda jsou všechna povinná pole vyplněna
  const title = document.getElementById('mapText').value.trim();
  const customText = document.getElementById('mapCustomText').value.trim();
  const email = document.getElementById('userEmail').value.trim();

  if (!title || !customText || !email) {
    alert('Vyplňte prosím všechna pole ve formuláři!');
    event.preventDefault();
    return false;
  }

  return true;
}

// Přidání event listeneru na odeslání formuláře
document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');

  // Generování JSON dat
  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // Pro pole route
  jsonCodeField.value = jsonData; // Pro pole json_code

  // Generování URL statické mapy (příklad)
  const mapImageURL = generateMapImageURL();
  mapImageField.value = mapImageURL;
});
