import { logEvent } from 'firebase/analytics';
import { analytics } from './firebase';

// Analytics utility functions
export const trackEvent = (eventName, parameters = {}) => {
  if (analytics) {
    logEvent(analytics, eventName, parameters);
  }
};

// Track page views
export const trackPageView = (pageName) => {
  trackEvent('page_view', {
    page_title: pageName,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// Track user interactions
export const trackUserInteraction = (action, category, label = null, value = null) => {
  trackEvent('user_interaction', {
    action: action,
    category: category,
    label: label,
    value: value
  });
};

// Track map interactions
export const trackMapInteraction = (action, details = {}) => {
  trackEvent('map_interaction', {
    action: action,
    ...details
  });
};

// Track search events
export const trackSearch = (searchTerm, resultsCount = null) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount
  });
};

// Track location events
export const trackLocationEvent = (action, locationId = null, locationName = null) => {
  trackEvent('location_event', {
    action: action,
    location_id: locationId,
    location_name: locationName
  });
};

// Track navigation events
export const trackNavigation = (action, fromLocation = null, toLocation = null) => {
  trackEvent('navigation', {
    action: action,
    from_location: fromLocation,
    to_location: toLocation
  });
};

// Track app performance
export const trackPerformance = (metric, value, unit = 'ms') => {
  trackEvent('performance', {
    metric: metric,
    value: value,
    unit: unit
  });

  
};

// Track errors
export const trackError = (error, errorMessage, errorCode = null) => {
  trackEvent('error', {
    error: error,
    error_message: errorMessage,
    error_code: errorCode
  });
};

// Set customer API key for user identification
export const setCustomerApiKey = (apiKey) => {
  if (analytics) {
    // Set user properties for better analytics segmentation
    trackEvent('set_user_properties', {
      customer_api_key: apiKey
    });
    
    // Also track as a custom event for easier filtering
    trackEvent('customer_api_set', {
      api_key: apiKey
    });
  }
};

// Track custom events
export const trackCustomEvent = (eventName, parameters = {}) => {
  trackEvent(eventName, parameters);
};
