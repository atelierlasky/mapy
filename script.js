// Funkce pro generování URL odkazu na editor mapy
function generateEditorURL() {
  const baseURL = 'https://www.mapeditor.com/editor'; // URL editoru mapy
  const coordinates = routeData.map((point) => `${point.lng},${point.lat}`).join(';');
  return `${baseURL}?coordinates=${encodeURIComponent(coordinates)}`;
}

// Před odesláním formuláře přidáme data a URL mapy
document.getElementById('mapForm').addEventListener('submit', (event) => {
  if (!validateForm(event)) return;

  const routeField = document.getElementById('mapRoute');
  const jsonCodeField = document.getElementById('mapJsonCode');
  const mapImageField = document.getElementById('mapImageUrl');
  const editorURLField = document.createElement('input'); // Skryté pole pro editor URL

  // Generování JSON dat
  const jsonData = JSON.stringify(routeData, null, 2);
  routeField.value = jsonData; // Pro pole route
  jsonCodeField.value = jsonData; // Pro pole json_code

  // Generování URL statické mapy
  const mapImageURL = generateMapImageURL();
  mapImageField.value = mapImageURL;

  // Generování URL editoru mapy a přidání do formuláře
  const editorURL = generateEditorURL();
  editorURLField.type = 'hidden';
  editorURLField.name = 'editor_url';
  editorURLField.value = editorURL;
  document.getElementById('mapForm').appendChild(editorURLField); // Přidáme pole do formuláře
});
