# MapsIndoors Web SDK Tutorial

This is a complete implementation of the [MapsIndoors Web SDK Tutorial](https://docs.mapsindoors.com/sdks-and-frameworks/web/tutorial) based on the official documentation.

## Features

This tutorial demonstrates:

1. **Map Display** - Initialize and display a MapsIndoors map using Google Maps
2. **Floor Selector** - Navigate between building floors
3. **Location Search** - Search for locations and highlight results on the map
4. **Directions/Routing** - Get directions between two locations with route visualization

## Prerequisites

Before running this tutorial, you need:

1. **MapsIndoors API Key** - Get your API key from [MapsIndoors](https://www.mapsindoors.com/)
   - For testing, you can use the demo key: `02c329e6777d431a88480a09`
2. **Google Maps JavaScript API Key** - Get your API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Required APIs: Maps JavaScript API, Directions API (for routing)

## Setup Instructions

1. **Update API Keys**

   Edit `index.html` and replace the placeholder API keys:

   ```html
   <!-- Replace YOUR_MAPSINDOORS_API_KEY with your actual MapsIndoors API key -->
   <script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.48.0/mapsindoors-4.48.0.js.gz?apikey=YOUR_MAPSINDOORS_API_KEY"></script>
   
   <!-- Replace YOUR_GOOGLE_MAPS_API_KEY with your actual Google Maps API key -->
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry"></script>
   ```

2. **Run the Tutorial**

   You can run this tutorial in several ways:

   **Option 1: Using a local web server (recommended)**

   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

   Then open `http://localhost:8000` in your browser.

   **Option 2: Direct file access**

   Simply open `index.html` in your browser (note: some features may not work due to CORS restrictions).

## How to Use

### Search for Locations

1. Type at least 3 characters in the "Search locations..." input field
2. Matching locations will appear in a list below
3. Click on a location to:
   - Pan and zoom the map to that location
   - Switch to the correct floor
   - Select and highlight the location on the map
4. All matching locations are highlighted on the map

### Get Directions

1. Enter an origin location in the "Enter origin..." field
2. Select a location from the dropdown
3. Enter a destination location in the "Enter destination..." field
4. Select a location from the dropdown
5. Click "Show Route" to display the route between the two locations
6. Click "Cancel" to clear the route and reset the form

## File Structure

```
demos/
├── index.html    # Main HTML file with SDK includes and UI structure
├── style.css     # Styling for the tutorial interface
├── main.js       # Core JavaScript logic (map init, search, directions)
└── README.md     # This file
```

## Key Concepts Demonstrated

### Map Initialization

```javascript
const mapViewInstance = new mapsindoors.mapView.GoogleMapsView(mapViewOptions);
const mapsIndoorsInstance = new mapsindoors.MapsIndoors({ mapView: mapViewInstance });
```

### Location Search

```javascript
const locations = await mapsindoors.services.LocationsService.getLocations({ q: query });
mapsIndoorsInstance.highlight(locations.map(l => l.id));
```

### Directions

```javascript
const directionsService = new mapsindoors.services.DirectionsService(
  new mapsindoors.directions.GoogleMapsProvider()
);
const result = await directionsService.getRoute({
  origin: originCoord,
  destination: destCoord,
  travelMode: 'WALKING'
});
```

## Troubleshooting

### Map doesn't load

- Verify your MapsIndoors API key is correct
- Check the browser console for error messages
- Ensure the API key has access to the solution you're trying to view

### Search doesn't work

- Make sure you're typing at least 3 characters
- Check that your MapsIndoors API key has the correct permissions
- Verify the solution has locations configured

### Directions don't work

- Ensure your Google Maps API key has the Directions API enabled
- Check that both origin and destination locations are selected
- Verify the locations are in the same building/venue

## Next Steps

After completing this tutorial, you can:

- Explore the [MapsIndoors Web SDK Documentation](https://docs.mapsindoors.com/sdks-and-frameworks/web)
- Check out the [Map Template](../map-template) for a more complete React implementation
- Review the [Web Components](../components) for reusable UI components
- Learn about [Display Rules](https://docs.mapsindoors.com/sdks-and-frameworks/web/display-rules) to customize map appearance
- Implement [Custom Icons](https://docs.mapsindoors.com/sdks-and-frameworks/web/custom-icons) for locations

## Resources

- [MapsIndoors Web SDK Documentation](https://docs.mapsindoors.com/sdks-and-frameworks/web)
- [MapsIndoors Tutorial](https://docs.mapsindoors.com/sdks-and-frameworks/web/tutorial)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [MapsIndoors Support](https://support.mapsindoors.com/)
