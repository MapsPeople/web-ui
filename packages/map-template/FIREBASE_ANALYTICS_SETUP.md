# Firebase Analytics Setup Guide

This guide will help you set up Firebase Analytics for your MapsIndoors Map Template application.

## Prerequisites

- A Firebase project with Analytics enabled
- Firebase configuration values from your project

## Setup Steps

### 1. Get Firebase Configuration

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon) > General tab
4. Scroll down to "Your apps" section
5. If you haven't added a web app yet, click "Add app" and select the web icon
6. Register your app with a nickname (e.g., "MapsIndoors Web App")
7. Copy the Firebase configuration object

### 2. Create Environment Variables

Create a `.env` file in the root of the map-template package with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Existing environment variables
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
```

Replace the placeholder values with your actual Firebase configuration values.

### 3. Enable Analytics in Firebase Console

1. In your Firebase Console, go to Analytics > Events
2. Make sure Analytics is enabled for your project
3. You can also set up custom events and conversions here

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run start
   ```

2. Open your browser's Developer Tools (F12)
3. Go to the Network tab
4. Look for requests to `google-analytics.com` or `analytics.google.com`
5. You should see analytics events being sent

### 5. View Analytics Data

1. Go to your Firebase Console
2. Navigate to Analytics > Events
3. You should see events like:
   - `page_view` - When the app loads
   - `map_interaction` - When the map initializes
   - `user_interaction` - Various user actions

## Available Analytics Events

The application tracks the following events:

### Page Views
- `page_view` - Tracks when the app loads

### Map Interactions
- `map_interaction` - Tracks map-related events
  - `map_initialized` - When the map component loads

### User Interactions
- `user_interaction` - General user interaction tracking
- `search` - Search events
- `location_event` - Location-related events
- `navigation` - Navigation events
- `performance` - Performance metrics
- `error` - Error tracking

## Customizing Analytics

You can add more analytics tracking by importing the analytics functions:

```javascript
import { 
  trackEvent, 
  trackPageView, 
  trackUserInteraction, 
  trackMapInteraction,
  trackSearch,
  trackLocationEvent,
  trackNavigation,
  trackPerformance,
  trackError,
  trackCustomEvent
} from './analytics';
```

## Privacy Considerations

- The app only initializes analytics in browser environments
- Analytics respects user privacy settings
- No personal data is collected without explicit user action
- All tracking is anonymous by default

## Troubleshooting

### Analytics Not Working
1. Check that all environment variables are set correctly
2. Verify the Firebase project has Analytics enabled
3. Check browser console for any Firebase-related errors
4. Ensure the measurement ID is correct

### No Data in Firebase Console
- Analytics data can take up to 24 hours to appear
- Make sure you're looking at the correct Firebase project
- Check that events are being sent in the Network tab

### Development vs Production
- Analytics works in both development and production
- Use different Firebase projects for different environments if needed
- Test thoroughly in development before deploying to production
