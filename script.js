<script>emailjs.init("ETVZN_o8hJ4XCn8Ms");

document.getElementById("map-form").addEventListener("submit", function(e) {
  e.preventDefault();

  if (!document.getElementById("consent-checkbox").checked) {
    alert("Prosím, potvrďte souhlas.");
    return;
  }

  const gps = document.getElementById("gps-coordinates").value;
  const text = document.querySelector('textarea[name="text"]').value;
  const userEmail = document.querySelector('input[name="reply_to"]').value;

  const combined = `GPS souřadnice: ${gps}\nText na vygravírování: ${text}`;

  // Zkopíruj do schránky
  navigator.clipboard.writeText(combined).then(() => {
    // Odešli e-mail přes EmailJS
    emailjs.sendForm("default_service", "mapa", this)
      .then(() => {
        alert("Děkujeme, mapa byla v pořádku odeslána do našeho ateliéru. Prosíme, objednejte si zvolené provedení.");
        this.reset();
      })
      .catch((err) => {
        console.error("Chyba:", err);
        alert("Odeslání se nezdařilo.");
      });
  });
});


    document.getElementById("copy-btn").addEventListener("click", () => {
      const gps = document.getElementById("gps-coordinates").value;
      navigator.clipboard.writeText(gps).then(() => {
        const btn = document.getElementById("copy-btn");
        btn.textContent = "ZKOPÍROVÁNO!";
        setTimeout(() => (btn.textContent = "OKOPÍROVAT GPS"), 2000);
      });
    });

    function initMap() {
const mapStyle = [
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }] // pozadí POI
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#333333" }] // nápisy POI
  },
  {
    featureType: "poi",
    elementType: "labels.icon",
    stylers: [{ saturation: -100 }] // tmavší ikony
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e3e3e3" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#888888" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#6b98c3" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#e6e6e6" }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f2f2f2" }]
  }
];

      const defaultLocation = { lat: 50.083815, lng: 14.395536 };
      const map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLocation,
        zoom: 15,
        styles: mapStyle,
        mapTypeControl: false,
        streetViewControl: false,
      });

      const geocoder = new google.maps.Geocoder();
      const infowindow = new google.maps.InfoWindow();
      const input = document.getElementById("pac-input");
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.bindTo("bounds", map);

      let marker = new google.maps.Marker({
        map,
        draggable: true,
        icon: {
          url: "https://www.atelierlasky.cz/user/documents/upload/favorite_50dp_D2005F_FILL1_wght400_GRAD0_opsz48.svg",
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 40)
        },
        visible: false
      });

      marker.addListener("dragend", () => {
        updateLocation(marker.getPosition());
      });

      autocomplete.addListener("place_changed", () => {
        infowindow.close();
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        map.setCenter(place.geometry.location);
        map.setZoom(17);
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        updateLocation(place.geometry.location);
      });

      map.addListener("click", (e) => {
        marker.setPosition(e.latLng);
        marker.setVisible(true);
        updateLocation(e.latLng);
      });

      document.getElementById("search-btn").addEventListener("click", () => {
        const address = input.value.trim();
        if (!address) return;
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results[0]) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(17);
            marker.setPosition(results[0].geometry.location);
            marker.setVisible(true);
            updateLocation(results[0].geometry.location);
          }
        });
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("search-btn").click();
        }
      });

      function updateLocation(latLng) {
        const lat = latLng.lat().toFixed(6);
        const lng = latLng.lng().toFixed(6);
        document.getElementById("gps-coordinates").value = `${lat}, ${lng}`;
        geocoder.geocode({ location: latLng }, (results, status) => {
          const address = status === "OK" && results[0] ? results[0].formatted_address : "Adresa není k dispozici";
          infowindow.setContent(`
            <strong>GPS souřadnice:</strong><br>${lat}, ${lng}<br>
            <strong>Adresa:</strong><br>${address}
          `);
          infowindow.open(map, marker);
        });
      }
    }</script>
