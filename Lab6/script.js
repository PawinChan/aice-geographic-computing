window.addEventListener('load', initializeMap);
window.addEventListener('load', initializeLocation);



map = null
stations = {}
poiLayers = {}
currentLocationInitialized = false
currentLocation = { lat: 13.7563, lon: 100.5018 }

function getDisplayName(brand) {
  let names = {
    "ptt": "PTT",
    "bcp": "Bangchak",
    "shell": "Shell",
    "caltex": "Caltex",
    "pt": "PT"
  }
  return names[brand];
}

function initializeLocation() {
  navigator.geolocation.watchPosition(
    (position) => {
      currentLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
      if (!currentLocationInitialized) {
        locationStatus.innerHTML = "Location Ready."
        currentLocationInitialized = true
        reCenter()
        setTimeout(addMarkers, 1200)
      }
    },
    (error) => { console.warn(error) },
    { enableHighAccuracy: true, maximumAge: 60000 }
  );
}

async function initializeMap() {
  map = L.map('map').setView([13.7563, 100.5018], 12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  await getData()
  document.getElementById('filterByBrand').addEventListener('change', filterLocations)
}

function filterLocations() {
  const brand = document.getElementById('filterByBrand').value
  const allLayers = Object.values(poiLayers)

  showOilPrice(brand)

  if (brand === 'all') {
    allLayers.forEach(layer => {
      map.addLayer(layer)
    })
  } else {
    allLayers.forEach(layer => {
      map.removeLayer(layer)
    })
    map.addLayer(poiLayers[brand])
  }
}

function showOilPrice(brand) {
  let fuelInfoEl = document.getElementById('fuelInfo')
  var content = `<table>
  <thead>
    <tr>
      <th>Fuel Type</th>
      <th>Price (THB)</th>
    </tr>
  </thead>
  <tbody>`
  for (var [fuelType, price] of Object.entries(oilprices[brand])) {
    content += `
    <tr>
      <td>${fuelType}</td>
      <td>${price}</td>  
    </tr>`
  }
  content += `</tbody></table>`

  fuelInfoEl.innerHTML = content;
}

function reCenter() {
  locationStatus.innerHTML = "Obtaining your location..."
  map.flyTo(currentLocation, 12);
  locationStatus.innerHTML = ''
}

async function getData() {
  const response = await fetch('./data.json');
  const data = await response.json();
  stations = data
  showStatistics()
  return data;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function showStatistics() {
  const statistics = {
    'ptt': stations.ptt.length,
    'bcp': stations.bcp.length,
    'shell': stations.shell.length,
    'caltex': stations.caltex.length,
    'pt': stations.pt.length,
  }

  const statisticsElement = document.getElementById('statistics')
  statisticsElement.innerHTML = ''


  let statsTitle = document.createElement('h3')
  statsTitle.innerHTML = 'Statistics Stuff'
  statisticsElement.appendChild(statsTitle)

  for (const [brand, count] of Object.entries(statistics)) {
    const brandElement = document.createElement('div')
    brandElement.innerHTML = `<b>${getDisplayName(brand)}</b>: ${count}`
    statisticsElement.appendChild(brandElement)
  }

}

async function addMarkers() {
  const brands = ['ptt', 'bcp', 'shell', 'caltex', 'pt']
  const brandMarkers = {
    'ptt': blueIcon,
    'bcp': greenIcon,
    'shell': goldIcon,
    'caltex': redIcon,
    'pt': violetIcon,
  }
  for (const brand of brands) {
    const stationsByBrand = stations[brand]

    var markers = []
    
    for (const station of stationsByBrand) {
      const marker = L.marker([station.lat, station.lon], { icon: brandMarkers[brand] });
      
      marker.bindPopup(`
        <b>${shortName = station.display_name.split(',').slice(0, 2).join(' - ')}</b><br>
        <b>Brand:</b> ${brand}<br>
      `);
      markers.push(marker)
      // <b>Price:</b> ${station.price}<br>
      // <b>Address:</b> ${station.address}<br>
      // <b>Location:</b> ${station.lat}, ${station.lng}
    }

    poiLayers[brand] = L.layerGroup(markers).addTo(map);
  }

}