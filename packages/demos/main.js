// main.js - MapsIndoors Tutorial Implementation

// Wait for both MapsIndoors SDK and Mapbox to be loaded
let mapsIndoorsInstance = null;
let mapViewInstance = null;
let directionsRenderer = null;
let originLocation = null;
let destinationLocation = null;

// Mapbox access token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoianByaWNlNjc5MSIsImEiOiJjbWtqNWo3OHoxMnI5M2NwbmlwM2locDhlIn0._L18RGG3ZVn-QeD6zs-MEQ';

// Initialize the application when both SDKs are ready
function initApp() {
  if (typeof mapsindoors === 'undefined' || typeof mapboxgl === 'undefined') {
    console.log('Waiting for SDKs to load...');
    setTimeout(initApp, 100);
    return;
  }

  console.log('Initializing MapsIndoors...');

  // Initialize Map View (Mapbox)
  const mapViewOptions = {
    accessToken: MAPBOX_ACCESS_TOKEN,
    element: document.getElementById('map'),
    center: { lat: 38.8974905, lng: -77.0362723 }, // Default: White House
    zoom: 17,
    maxZoom: 22,
  };

  mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
  mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });

  // Add Floor Selector control to Mapbox
  const mapboxInstance = mapViewInstance.getMap();
  const floorSelectorEl = document.createElement('div');
  const floorSelectorInstance = new mapsindoors.FloorSelector(floorSelectorEl, mapsIndoorsInstance);
  
  // Create a Mapbox control for the Floor Selector
  const floorSelectorControl = {
    onAdd: () => {
      floorSelectorEl.classList.add('mapboxgl-ctrl');
      return floorSelectorEl;
    },
    onRemove: () => {
      if (floorSelectorEl.parentNode) {
        floorSelectorEl.parentNode.removeChild(floorSelectorEl);
      }
    }
  };
  
  mapboxInstance.addControl(floorSelectorControl, 'top-right');

  // Add navigation controls
  const navigationControl = new mapboxgl.NavigationControl();
  mapboxInstance.addControl(navigationControl, 'top-left');

  // Wait for MapsIndoors to be ready before setting up search and directions
  mapsIndoorsInstance.on('ready', () => {
    console.log('MapsIndoors is ready!');
    
    // Wait a bit for the venue to be set
    setTimeout(() => {
      // Initialize Directions Service
      const directionsService = new mapsindoors.services.DirectionsService(
        new mapsindoors.directions.MapboxProvider(MAPBOX_ACCESS_TOKEN)
      );

      // Setup search functionality
      setupSearch();

      // Setup directions functionality
      setupDirections(directionsService);
    }, 500);
  });

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

  // Check if elements exist
  if (!searchInput || !searchResultsEl) {
    console.error('Search input or results element not found');
    return;
  }

  // Create debounced search function
  const debouncedSearch = debounce(async (query) => {
    await performSearch(query);
  }, 500);

  async function performSearch(query) {
    const searchQuery = typeof query === 'string' ? query : query.target?.value || '';
    
    if (!searchQuery || searchQuery.trim().length < 3) {
      searchResultsEl.innerHTML = '';
      if (mapsIndoorsInstance) {
        mapsIndoorsInstance.highlight();
        mapsIndoorsInstance.selectLocation(null);
      }
      return;
    }

    // Check if MapsIndoors is ready
    if (!mapsIndoorsInstance) {
      console.error('MapsIndoors instance not available');
      searchResultsEl.innerHTML = '<li style="color: red;">MapsIndoors not initialized</li>';
      return;
    }

    // Show loading state
    searchResultsEl.innerHTML = '<li style="color: #666; font-style: italic;">Searching...</li>';

    try {
      const params = { q: searchQuery.trim() };
      console.log('Searching with params:', params);
      console.log('MapsIndoors instance:', mapsIndoorsInstance);
      console.log('LocationsService:', mapsindoors.services.LocationsService);
      
      const locations = await mapsindoors.services.LocationsService.getLocations(params);
      console.log('Search results:', locations);

      // Show list of results
      searchResultsEl.innerHTML = '';
      
      if (!locations || locations.length === 0) {
        searchResultsEl.innerHTML = '<li style="color: #666; font-style: italic;">No locations found</li>';
        if (mapsIndoorsInstance) {
          mapsIndoorsInstance.highlight();
        }
        return;
      }

      locations.forEach(loc => {
        const li = document.createElement('li');
        li.textContent = loc.properties.name || 'Unnamed location';
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          // Pan/zoom to location, switch floor, and select it
          if (loc.properties.anchor && loc.properties.anchor.coordinates) {
            mapsIndoorsInstance.goTo({
              lat: loc.properties.anchor.coordinates[1],
              lng: loc.properties.anchor.coordinates[0],
              floor: loc.properties.floor
            });
            if (loc.properties.floor !== undefined) {
              mapsIndoorsInstance.setFloor(loc.properties.floor);
            }
          }
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
      console.error('Error stack:', err.stack);
      searchResultsEl.innerHTML = '<li style="color: red;">Error searching locations: ' + (err.message || 'Unknown error') + '</li>';
    }
  }

  // Add event listener
  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // Also allow Enter key to trigger search
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      debouncedSearch(e.target.value);
    }
  });

  console.log('Search functionality initialized');
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

    if (!mapsIndoorsInstance) {
      console.error('MapsIndoors instance not available');
      targetListEl.innerHTML = '<li style="color: red;">MapsIndoors not initialized</li>';
      return;
    }

    const debouncedSearch = debounce(async () => {
      try {
        const locs = await mapsindoors.services.LocationsService.getLocations({ q: query.trim() });
        targetListEl.innerHTML = '';
        
        if (!locs || locs.length === 0) {
          targetListEl.innerHTML = '<li style="color: #666; font-style: italic;">No locations found</li>';
          return;
        }

        locs.forEach(loc => {
          const li = document.createElement('li');
          li.textContent = loc.properties.name || 'Unnamed location';
          li.addEventListener('click', () => {
            callback(loc);
            targetListEl.innerHTML = '';
          });
          targetListEl.appendChild(li);
        });
      } catch (e) {
        console.error('Location search error:', e);
        targetListEl.innerHTML = '<li style="color: red;">Error searching locations: ' + (e.message || 'Unknown error') + '</li>';
      }
    }, 400);
    
    debouncedSearch();
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
