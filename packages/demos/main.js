// main.js - MapsIndoors Tutorial Implementation

// Wait for both MapsIndoors SDK and Google Maps to be loaded
let mapsIndoorsInstance = null;
let mapViewInstance = null;
let directionsRenderer = null;
let originLocation = null;
let destinationLocation = null;

// Initialize the application when both SDKs are ready
function initApp() {
  if (typeof mapsindoors === 'undefined' || typeof google === 'undefined') {
    console.log('Waiting for SDKs to load...');
    setTimeout(initApp, 100);
    return;
  }

  console.log('Initializing MapsIndoors...');

  // Initialize Map View (Google Maps)
  const mapViewOptions = {
    element: document.getElementById('map'),
    center: { lat: 38.8974905, lng: -77.0362723 }, // Default: White House
    zoom: 17,
    maxZoom: 22,
  };

  mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);
  mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });

  // Add Floor Selector control to Google Maps
  const googleMapsInstance = mapViewInstance.getMap();
  const floorSelectorEl = document.createElement('div');
  new mapsindoors.FloorSelector(floorSelectorEl, mapsIndoorsInstance);
  googleMapsInstance.controls[google.maps.ControlPosition.RIGHT_TOP].push(floorSelectorEl);

  // Initialize Directions Service
  const directionsService = new mapsindoors.services.DirectionsService(
    new mapsindoors.directions.GoogleMapsProvider()
  );

  // Setup search functionality
  setupSearch();

  // Setup directions functionality
  setupDirections(directionsService);

  console.log('MapsIndoors initialized successfully!');
}

// Debounce helper function
function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Setup search functionality
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResultsEl = document.getElementById('search-results');

  async function performSearch(query) {
    if (!query || query.trim().length < 3) {
      searchResultsEl.innerHTML = '';
      mapsIndoorsInstance.highlight();
      mapsIndoorsInstance.selectLocation(null);
      return;
    }

    try {
      const params = { q: query };
      const locations = await mapsindoors.services.LocationsService.getLocations(params);

      // Show list of results
      searchResultsEl.innerHTML = '';
      locations.forEach(loc => {
        const li = document.createElement('li');
        li.textContent = loc.properties.name;
        li.addEventListener('click', () => {
          // Pan/zoom to location, switch floor, and select it
          mapsIndoorsInstance.goTo({
            lat: loc.properties.anchor.coordinates[1],
            lng: loc.properties.anchor.coordinates[0],
            floor: loc.properties.floor
          });
          mapsIndoorsInstance.setFloor(loc.properties.floor);
          mapsIndoorsInstance.selectLocation(loc);
          // Highlight the selected location
          mapsIndoorsInstance.highlight([loc.id]);
        });
        searchResultsEl.appendChild(li);
      });

      // Highlight all results on the map
      mapsIndoorsInstance.highlight(locations.map(l => l.id));
    } catch (err) {
      console.error('Search error:', err);
      searchResultsEl.innerHTML = '<li style="color: red;">Error searching locations</li>';
    }
  }

  searchInput.addEventListener('input', debounce((e) => performSearch(e.target.value), 500));
}

// Setup directions functionality
function setupDirections(directionsService) {
  const originInput = document.getElementById('origin-input');
  const originResultsEl = document.getElementById('origin-results');
  const destinationInput = document.getElementById('destination-input');
  const destinationResultsEl = document.getElementById('destination-results');
  const showRouteBtn = document.getElementById('show-route');
  const cancelRouteBtn = document.getElementById('cancel-route');

  // Helper function to search for locations
  function searchForLocation(query, targetListEl, callback) {
    if (!query || query.trim().length < 3) {
      targetListEl.innerHTML = '';
      return;
    }

    debounce(async () => {
      try {
        const locs = await mapsindoors.services.LocationsService.getLocations({ q: query });
        targetListEl.innerHTML = '';
        locs.forEach(loc => {
          const li = document.createElement('li');
          li.textContent = loc.properties.name;
          li.addEventListener('click', () => {
            callback(loc);
            targetListEl.innerHTML = '';
          });
          targetListEl.appendChild(li);
        });
      } catch (e) {
        console.error('Location search error:', e);
        targetListEl.innerHTML = '<li style="color: red;">Error searching locations</li>';
      }
    }, 400)();
  }

  // Setup origin input listener
  originInput.addEventListener('input', (e) => {
    searchForLocation(e.target.value, originResultsEl, (loc) => {
      originLocation = loc;
      originInput.value = loc.properties.name;
    });
  });

  // Setup destination input listener
  destinationInput.addEventListener('input', (e) => {
    searchForLocation(e.target.value, destinationResultsEl, (loc) => {
      destinationLocation = loc;
      destinationInput.value = loc.properties.name;
    });
  });

  // Show route button handler
  showRouteBtn.addEventListener('click', async () => {
    if (!originLocation || !destinationLocation) {
      alert('Please select both origin and destination');
      return;
    }

    try {
      const originCoord = {
        lat: originLocation.properties.anchor.coordinates[1],
        lng: originLocation.properties.anchor.coordinates[0],
        floor: originLocation.properties.floor
      };

      const destCoord = {
        lat: destinationLocation.properties.anchor.coordinates[1],
        lng: destinationLocation.properties.anchor.coordinates[0],
        floor: destinationLocation.properties.floor
      };

      const result = await directionsService.getRoute({
        origin: originCoord,
        destination: destCoord,
        travelMode: 'WALKING'
      });

      // Render the route
      if (directionsRenderer) {
        directionsRenderer.setRoute(null); // Clear existing route
      } else {
        directionsRenderer = new mapsindoors.directions.DirectionsRenderer({
          mapsIndoors: mapsIndoorsInstance,
          fitBounds: true
        });
      }

      directionsRenderer.setRoute(result);
      console.log('Route displayed successfully');
    } catch (err) {
      console.error('Error getting route:', err);
      alert('Error getting route. Please try again.');
    }
  });

  // Cancel route button handler
  cancelRouteBtn.addEventListener('click', () => {
    if (directionsRenderer) {
      directionsRenderer.setRoute(null);
    }
    originLocation = null;
    destinationLocation = null;
    originInput.value = '';
    destinationInput.value = '';
    originResultsEl.innerHTML = '';
    destinationResultsEl.innerHTML = '';
  });
}

// Start the application
initApp();
