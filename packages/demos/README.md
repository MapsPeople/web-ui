# MapsIndoors Web SDK Tutorial

This is a complete implementation of the [MapsIndoors Web SDK Tutorial](https://docs.mapsindoors.com/sdks-and-frameworks/web/tutorial) based on the official documentation.

## Features

This tutorial demonstrates:

1. **Map Display** - Initialize and display a MapsIndoors map using Mapbox
2. **Floor Selector** - Navigate between building floors
3. **Location Search** - Search for locations and highlight results on the map
4. **Directions/Routing** - Get directions between two locations with route visualization

## Prerequisites

Before running this tutorial, you need:

1. **MapsIndoors API Key** - Get your API key from [MapsIndoors](https://www.mapsindoors.com/)
   - For testing, you can use the demo key: `02c329e6777d431a88480a09`
2. **Mapbox Access Token** - Get your access token from [Mapbox](https://www.mapbox.com/)
   - Sign up for a free account at [Mapbox](https://account.mapbox.com/) to get your access token

## Setup Instructions

1. **Update API Keys**

   Edit `main.js` and replace the Mapbox access token:

   ```javascript
   // Replace YOUR_MAPBOX_ACCESS_TOKEN with your actual Mapbox access token
   const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN';
   ```

   Note: The MapsIndoors API key is already configured in `index.html` as `02c329e6777d431a88480a09`.

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
const mapViewInstance = new mapsindoors.mapView.MapboxView(mapViewOptions);
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
  new mapsindoors.directions.MapboxProvider(MAPBOX_ACCESS_TOKEN)
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

- Ensure your Mapbox access token is correct and has the necessary permissions
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
- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [MapsIndoors Support](https://support.mapsindoors.com/)
