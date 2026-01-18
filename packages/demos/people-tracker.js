// people-tracker.js - Display multiple people's locations from a database

let peopleMarkers = [];
let mapboxInstance = null;
let updateInterval = null;

/**
 * Initialize people tracking on the map
 * @param {object} mapboxMap - The Mapbox map instance
 */
function initPeopleTracker(mapboxMap) {
  mapboxInstance = mapboxMap;
  
  // Load initial people locations
  loadPeopleLocations();
  
  // Update people locations every 5 seconds (adjust as needed)
  updateInterval = setInterval(() => {
    loadPeopleLocations();
  }, 5000);
}

/**
 * Fetch people's locations from your database/API
 * Replace this with your actual API endpoint
 */
async function fetchPeopleLocations() {
  try {
    // TODO: Replace this with your actual API endpoint
    // Example: const response = await fetch('https://your-api.com/api/people/locations');
    // const data = await response.json();
    // return data;
    
    // Mock data for demonstration - replace with real API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'John Doe',
            lat: 38.8975,
            lng: -77.0363,
            floor: 0,
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          {
            id: '2',
            name: 'Jane Smith',
            lat: 38.8978,
            lng: -77.0365,
            floor: 1,
            timestamp: new Date().toISOString(),
            status: 'active'
          },
          {
            id: '3',
            name: 'Bob Johnson',
            lat: 38.8972,
            lng: -77.0361,
            floor: 0,
            timestamp: new Date().toISOString(),
            status: 'active'
          }
        ]);
      }, 500);
    });
  } catch (error) {
    console.error('Error fetching people locations:', error);
    return [];
  }
}

/**
 * Load and display people's locations on the map
 */
async function loadPeopleLocations() {
  const people = await fetchPeopleLocations();
  
  // Remove existing markers
  clearPeopleMarkers();
  
  // Add new markers for each person
  people.forEach(person => {
    addPersonMarker(person);
  });
}

/**
 * Add a marker for a person on the map
 * @param {object} person - Person object with id, name, lat, lng, floor, etc.
 */
function addPersonMarker(person) {
  if (!mapboxInstance) return;
  
  // Create a custom HTML element for the marker
  const el = document.createElement('div');
  el.className = 'person-marker';
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#FF6B6B';
  el.style.border = '3px solid white';
  el.style.cursor = 'pointer';
  el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.fontSize = '14px';
  el.style.fontWeight = 'bold';
  el.style.color = 'white';
  
  // Add person's initial as marker content
  const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase();
  el.textContent = initials;
  el.title = person.name;
  
  // Create Mapbox marker
  const marker = new mapboxgl.Marker(el)
    .setLngLat([person.lng, person.lat])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="padding: 8px;">
            <strong>${person.name}</strong><br>
            <small>Floor: ${person.floor}</small><br>
            <small>Status: ${person.status}</small><br>
            <small>Last updated: ${new Date(person.timestamp).toLocaleTimeString()}</small>
          </div>
        `)
    )
    .addTo(mapboxInstance);
  
  // Store marker reference
  peopleMarkers.push({
    id: person.id,
    marker: marker,
    person: person
  });
}

/**
 * Remove all people markers from the map
 */
function clearPeopleMarkers() {
  peopleMarkers.forEach(item => {
    item.marker.remove();
  });
  peopleMarkers = [];
}

/**
 * Stop tracking people (cleanup)
 */
function stopPeopleTracker() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }
  clearPeopleMarkers();
}

// Export functions for use in main.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initPeopleTracker,
    stopPeopleTracker,
    loadPeopleLocations
  };
}
