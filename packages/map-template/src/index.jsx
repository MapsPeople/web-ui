import * as Sentry from "@sentry/react";
import React from 'react';
import ReactDOM from 'react-dom/client';
// import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';

Sentry.init({
dsn: "https://0ee7fa162023d958c96db25e99c8ff6c@o351128.ingest.sentry.io/4506851619831808",
// Set environment to localhost if the url includes it. Otherwise, set to production.
environment: window.location.hostname === 'localhost' ? 'localhost' : 'production',
integrations: [
    // See docs for support of different versions of variation of react router
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/integrations/react-router/
    // Sentry.reactRouterV6BrowserTracingIntegration({
    //         useEffect: React.useEffect,
    //         useLocation,
    //         useNavigationType,
    //         createRoutesFromChildren,
    //         matchRoutes
    // }),
    Sentry.replayIntegration()
],

// Set tracesSampleRate to 1.0 to capture 100%
// of transactions for performance monitoring.
tracesSampleRate: 1.0,

// Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
tracePropagationTargets: ["localhost", /^https:\/\/api\.mapsindoors\.com/],

// Capture Replay for 10% of all sessions,
// plus for 100% of sessions with an error
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
        <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
