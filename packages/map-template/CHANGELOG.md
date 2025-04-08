# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.74.6] - 2025-03-31

### Fixed

- Upgraded to SDK v4.39.2.

## [1.74.5] - 2025-03-26

### Fixed

- Disable sentry logging when running locally.

## [1.74.4] - 2025-03-26

### Fixed

- An issue when `pitch` and `bearing` props would not be respected when `startZoomLevel` prop is present.

## [1.74.3] - 2025-03-26

### Fixed

- An issue when `startZoomLevel` prop would not be respected when using `kioskOriginLocationId` or `locationId` props.

## [1.74.2] - 2025-03-25

### Fixed

- Order of longitude and latitude for the center prop was wrongly documented.

## [1.74.1] - 2025-03-19

### Fixed

- Fixed query parameter console error.

## [1.74.0] - 2025-03-18

### Added

- New `useAppTitle` prop that specifies if the Map Template should set the document title as defined in the App Config.

## [1.73.0] - 2025-03-17

### Added

- New minZoom value which is 10.
- Fixed an issue when wayfinding would not show the whole route.

## [1.72.3] - 2025-03-13

### Fixed

- Don't snap bottom sheet on small screens to full height when entering Wayfinding in order to make space for selecting Locations on the map.

## [1.72.2] - 2025-03-13

### Fixed

- Fix focus state colors and text.

## [1.72.1] - 2025-03-12

### Fixed

- An issue when `startZoomLevel` prop would not work on zoom level 18.

## [1.72.0] - 2025-03-11

### Added

- Add support for additional location details that can be configured in the CMS

## [1.71.2] - 2025-03-10

### Fixed

- Upgraded to SDK v4.39.0.

## [1.71.1] - 2025-03-04

### Fixed

- An issue when `showRoadNames` prop would not work in some cases.

## [1.71.0] - 2025-02-26

### Added

- In Wayfinding view, is is now possible to click on a MapsIndoors Location on the map to set it as either origin or destination, depending on which field is active (note: to set destination, the destination field must be empty)

## [1.70.0] - 2025-02-20

### Changed

- Removed last step `You have arrived.` from the wayfinding.

## [1.69.2] - 2025-02-19

### Fixed

- When route is Finished, category selected before is now unselected.

## [1.69.1] - 2025-02-18

### Fixed

- The map now correctly zoom to a Location as expected when using the `locationId` or `kioskOriginLocationId` prop.

## [1.69.0] - 2025-02-17

### Added

- Share functionality: From the Location details view the user can now copy a URL or scan a QR code that links to the Location (requires the `supportsUrlParameters` prop to be true).

## [1.68.3] - 2025-02-13

### Fixed

- Fix 2D/3D selector not respecting the primaryColor query parameter

## [1.68.2] - 2025-02-11

### Fixed

- Aligned map-template version in package-lock.

## [1.68.1] - 2025-02-11

### Fixed

- An issue when on initial load map would stop in a random position.

## [1.68.0] - 2025-02-03

### Added

- Added display of 2D models in 3D mode based on app config property

## [1.67.0] - 2025-01-30

### Added

- Added support for `center` property.

## [1.66.7] - 2025-01-29

### Fixed

- Enabled and fixed eslint rules

## [1.66.6] - 2025-01-27

### Fixed

- Upgraded to SDK v4.38.6.

## [1.66.5] - 2025-01-27

### Fixed

- Fixed an issue with `startZoomLevel` prop causing the map starting in a random position.

## [1.66.4] - 2025-01-23

### Fixed

- Fix `miTransitionLevel` prop breaking the React Component package.

## [1.66.3] - 2025-01-23

### Fixed

- Fix package-lock issues.

## [1.66.2] - 2025-01-21

### Fixed

- Upgrade to SDK v.4.38.5.

## [1.66.1] - 2025-01-16

### Fixed

- Removed Create React App dependencies and replaced with standard ESLint rules

## [1.66.0] - 2025-01-16

### Added

- The map now fits to matching Locations when the user clicks/taps on a Category.

## [1.65.3] - 2025-01-15

### Fixed

- Fixed issue of clicking outside of MapsIndoors data to close the Categories tab

## [1.65.2] - 2025-01-13

### Fixed

- An issue where miTransitionLevel is not respected for Mapbox map.

## [1.65.1] - 2025-01-08

### Fixed

- Upgrade to SDK v4.38.3.

## [1.65.0] - 2025-01-08

### Added

- Added functionality to exit location details by clicking outside MapsIndoors data on the map for both Google Maps and Mapbox.

## [1.64.0] - 2025-01-02

### Added

- When panning/zooming to a Location, it will no longer zoom further in than zoom level 22.

## [1.63.0] - 2024-12-12

### Added

- Update "Accessibility" toggle text to "Avoid stairs and escalators"

## [1.62.1] - 2024-12-10

### Fixed

- Fixed bug that would cause a Google Maps map to never show.

## [1.62.0] - 2024-12-10

### Added

- Upgrade SDK version to v4.38.0.

## [1.61.1] - 2024-12-10

### Fixed

- Internal code refactor: The Map Template now uses the MIMap component from the `react-components` package, and the internal map components were removed.

## [1.61.0] - 2024-12-10

### Added

- Limit the maximum number of search results to 100 to improve render performance.

### Fixed

- Fixed a bug where the selected venue (in case no venue was set otherwise) was picked alphabetically by Administrative ID rather than the displayed Venue name.

## [1.60.0] - 2024-12-10

### Added

- Upgrade UI on the Wayfinding page.

## [1.59.0] - 2024-11-26

### Added

- Upgrade SDK version to v4.37.1.

## [1.58.0] - 2024-10-28

### Added

- Added new boolean prop `searchExternalLocations` for searches performed in the Wayfinding mode. If set to true, Mapbox/Google places will be displayed depending on the Map Provider you are using. If set to false, the results returned will only be MapsIndoors results. The default is false.

## [1.57.0] - 2024-10-22

### Added

- Upgrade SDK version to v4.36.3.

## [1.56.0] - 2024-10-21

### Added

- Added new boolean prop `searchExternalLocations` for searches performed in the Wayfinding mode. If set to true, Mapbox/Google places will be displayed depending on the Map Provider you are using. If set to false, the results returned will only be MapsIndoors results. The default is true.

## [1.55.2] - 2024-10-18

### Fixed

- Simplify documentation on the README files.

## [1.55.1] - 2024-10-17

### Fixed

- Mitigate memory leaks by cleaning up component state when unmounting.

## [1.55.0] - 2024-09-19

### Added

- Added support for dutch language.

## [1.54.7] - 2024-09-12

### Fixed

- Fix bug where wayfinding steps were misaligned.

## [1.54.6] - 2024-09-03

### Fixed

- Resolved an issue where kiosk scroll buttons were sometimes disabled, preventing users from clicking them.

## [1.54.5] - 2024-08-29

### Fixed

- Fix bug where 2D geometry was not always shown.

## [1.54.4] - 2024-08-14

### Fixed

- Fixed bug where pitch property was not respected in case 2D/3D switch was not shown.

## [1.54.3] - 2024-08-06

### Added

- Upgraded to MapsIndoors SDK v4.36.1.
- Upgraded to mapbox-gl v3.5.2.

## [1.54.2] - 2024-07-31

### Fixed

- Fixed various bugs related to the venues and 2D geometry.

## [1.54.1] - 2024-07-30

### Fixed

- Horizontal scroll buttons are not being properly disabled/enabled when necessary.

## [1.54.0] - 2024-07-04

### Added

- Expose the MapsIndoors instance so it can be used from outside.

## [1.53.1] - 2024-07-02

### Fixed

- Wayfinding 'Go' button is now disabled until route is fetched and ready to be displayed.

## [1.53.0] - 2024-07-01

### Added

- Add support for new parameter `showExternalIDs` which determines if the Location details should show the External ID or not.

## [1.52.0] - 2024-06-19

### Added

- Changed the order of how categories are displayed. Now their order is dictated by AppConfig.

## [1.51.1] - 2024-06-18

### Fixed

- Fixed issue where MapsIndoors data could be wrongly shown in the default language in case the given IETF language string consisted of more than a primary language subtag.

## [1.51.0] - 2024-06-17

### Added

- Added new property `showRoadNames`: A boolean parameter that dictates whether Mapbox road names should be shown. By default, Mapbox road names are hidden when MapsIndoors data is shown. It is dictated by `mi-transition-level` which default value is 17.

## [1.50.0] - 2024-06-17

### Added

- Added missing props `searchAllVenues` and `language` when creating the QR code URL.

## [1.49.0] - 2024-06-17

### Added

- Add support for Italian and Spanish languages.

## [1.48.2] - 2024-06-14

### Fixed

- Fixed an issue where the text in the Legend Information Modal in the Kiosk mode did not follow the expected formatting.

## [1.48.1] - 2024-06-14

### Fixed

- Fixed an issue with clearing search input causing console errors.

## [1.48.0] - 2024-06-13

### Added

- Add 2D/3D visibility switch component which can only be visible if the `mapbox`, `3dwalls` and `floorplan` modules are enabled in the CMS.

## [1.47.0] - 2024-06-12

### Added

- Upgraded to MapsIndoors SDK v4.35.0

## [1.46.0] - 2024-05-23

### Added

- Added new property `hideNonMatches` which determines whether the locations on the map should be filtered (only show the matched locations and hide the rest) or highlighted (show all locations and highlight the matched ones with a red dot by default). If set to true, the locations will be filtered.

## [1.45.0] - 2024-05-15

### Added

- Update the default behaviour to hide the External IDs when searching for locations.

## [1.44.3] - 2024-05-15

### Fixed

- Fixed QR code not working on GCS hosted solutions.

## [1.44.2] - 2024-04-25

### Fixed

- Fixed bottom sheet jumping outside the viewport when selecting a category.

## [1.44.1] - 2024-04-23

### Fixed

- Add missing `useKeyboard` prop from the `webcomponent.js` file

## [1.44.0] - 2024-04-16

### Added

- Update SDK and Mapbox version.

## [1.43.1] - 2024-04-08

### Fixed

- Fix the venue not updating correctly on the map.

## [1.43.0] - 2024-03-26

### Added

- Add support for new parameter `searchAllVenues` which searches across all venues in one solution.
- Change the default behaviour to search in one venue.

## [1.42.0] - 2024-03-26

### Added

- Enhance the visual representation of `non-selectable` locations in the search results list.

## [1.41.0] - 2024-03-19

### Added

- Added Custom Element definition to Web Component generation file. This means you can avoid inline scripting, and only load a single JS-file from a CDN to get up and running with the Map Template Web Component

## [1.40.0] - 2024-03-06

### Added

- Added Sentry for Error Logging and Performance Metrics

## [1.39.1] - 2024-03-04

### Added

- Added docs for `category` prop.

## [1.39.0] - 2024-02-29

### Added

- Added legend modal to the kiosk.

## [1.38.1] - 2024-02-28

### Fixed

- Added missing `language` prop to web component.

## [1.38.0] - 2024-02-28

### Added

- Added support for `category` property.

## [1.37.1] - 2024-02-26

### Fixed

- Fix size of the images on the Location Details page.

## [1.37.0] - 2024-02-22

### Added

- Remove hover from non-selectable locations.

## [1.36.4] - 2024-02-20

### Fixed

- Fixed Map Template height issue when running on WebView on iOS.

## [1.36.3] - 2024-02-19

### Added

- Added integrity hash to SDK script tag.

## [1.36.2] - 2024-02-15

### Added

- Upgraded to MapsIndoors SDK v4.30.0

## [1.36.1] - 2024-02-15

### Added

- Updated to MapsIndoors SDK v4.29.3

## [1.36.0] - 2024-02-13

### Added

- Added support for `miTransitionLevel` property.

## [1.35.1] - 2024-02-12

### Fixed

- Fixed QR code URL to work with different paths.

## [1.35.0] - 2024-02-08

### Added

- Hide zoom controls from mobile view.

## [1.34.1] - 2024-02-07

### Fixed

- Fixed QR code error.

## [1.34.0] - 2024-02-07

### Added

- Added support for searching for locations within the same venue when in kiosk mode.

## [1.33.4] - 2024-02-07

### Fixed

- Fixed accessibility state not resetting when using the timeout property.

## [1.33.3] - 2024-02-07

### Fixed

- Fixed search results state not resetting when using the timeout property.

## [1.33.2] - 2024-02-07

### Fixed

- Fixed error when scanning the QR code.

## [1.33.1] - 2024-02-02

### Added

- Added documentation for the kiosk properties.

## [1.33.0] - 2024-01-30

### Added

- Added vertical scroll buttons to the search results list
- Added horizontal scroll buttons to the categories list

## [1.32.0] - 2024-01-24

### Added

- Updated to MapsIndoors SDK v4.29.0

## [1.31.3] - 2024-01-24

### Fixed

- Fixed a bug where map would not always pan to a Location when clicked on it in a list of search results.

## [1.31.2] - 2024-01-23

### Fixed

- Fixed the directions not working on a mobile device.

## [1.31.1] - 2024-01-22

### Fixed

- Updated default values for `apiKey` and `venue` in the Map Template.

## [1.31.0] - 2024-01-22

### Added

- Map Template is using Mapbox GL JS 3.

## [1.30.0] - 2024-01-22

### Added

- Added support for a `timeout` property that can be used to reset the map and the UI to initial state after some seconds of inactivity.
- Updated directions design.

## [1.29.1] - 2024-01-22

### Fixed

- Fixed resetting the origin location when exiting the Wayfinding page.

## [1.29.0] - 2024-01-11

### Added

- Added support for loading Wayfinding view when having `directionsFrom` prop.

## [1.28.1] - 2024-01-10

### Fixed

- Fixed hosting of default logo to be on Amazon S3 bucket instead of assets folder.

## [1.28.0] - 2024-01-10

### Added

- Add support for using virtual keyboard by having `useKeyboard` property in Kiosk mode.

## [1.27.0] - 2024-01-08

### Added

- Add zoom control buttons for Mapbox and Google Maps.

## [1.26.0] - 2023-12-20

### Added

- Add support for French, German and Danish languages. The browser language is used to pick one of those, and it can also be forced with a new `language` property.

## [1.25.0] - 2023-12-18

### Added

- Added support for having QR code button when getting directions in Kiosk mode.

## [1.24.1] - 2023-12-14

### Fixed

- Fixed `startZoomLevel`, `pitch` and `bearing` properties not working together with other parameters.

## [1.24.0] - 2023-12-11

### Added

- New prop, `useMapProviderModule`: When set to true, the modules in the MapsIndoors Solution will be used to determine which map type to use.

## [1.23.0] - 2023-12-06

### Added

- Add support showing directions immediately after selecting a location in a Kiosk mode.

## [1.22.0] - 2023-12-06

### Added

- Add support for having one external ID.

## [1.21.0] - 2023-11-30

### Added

- It is now possible to set and use a Mapbox Access Token or Google Maps API key from the MapsIndoors App Config.

## [1.20.2] - 2023-11-29

### Added

- Upgrade to MapsIndoors JavaScript SDK v4.26.3.

## [1.20.1] - 2023-11-28

### Added

- Upgrade to MapsIndoors JavaScript SDK v4.26.2.

## [1.20.0] - 2023-11-27

### Added

- Add functionality for hiding venue selector and my position elements in a kiosk context.

## [1.19.0] - 2023-11-27

### Added

- Upgrade to MapsIndoors JavaScript SDK v4.26.1.

## [1.18.0] - 2023-11-17

### Added

- Added support for having `kioskOriginLocationId` property.
- Adjust UI to center the sidebar based on the `kioskOriginLocationId` property.

## [1.17.1] - 2023-11-15

### Fixed

- Bundling the exported Web Component into one file instead of several chunks to mitigate slow loading times when using the Web Component.

## [1.17.0] - 2023-11-06

### Added

- Added support for filter, search and highlight features from the SDK.
- Implemented functionality for selecting a location and centering it on the map.

### Fixed

- Fixed floor selector not updating when exiting directions.
- Fixed floor selector not updating when selecting a location on a different floor.

## [1.16.0] - 2023-10-09

### Added

- Added support for searching for Mapbox places in the Wayfinding.

## [1.15.1] - 2023-10-06

### Fixed

- Added latest version of the MI Components.

## [1.15.0] - 2023-10-06

### Added

- Added support for tilt and rotation properties.

## [1.14.2] - 2023-10-05

### Fixed

- Fixed bottom sheet not being fully visible on mobile devices.

## [1.14.1] - 2023-09-28

### Fixed

- Fixed outdated version of the SDK.

## [1.14.0] - 2023-09-27

### Added

- Upgrade to MapsIndoors JavaScript SDK v4.24.7 which enables the possibility of zooming to level 25 on Mapbox where applicable.

## [1.13.0] - 2023-09-19

### Added

- Make a `Use My Position` option in the Wayfinding.

## [1.12.3] - 2023-09-11

### Fixed

- Fixed wrong usage of clear function on localStorage.

## [1.12.2] - 2023-09-04

### Fixed

- Fixed documentation for the My Position component.

## [1.12.1] - 2023-09-04

### Fixed

- Fixed My Position URL parameter not working.

## [1.12.0] - 2023-08-24

### Added

- Added support for Google Maps Map ID prop.

## [1.11.2] - 2023-08-23

### Fixed

- Upgrade to MapsIndoors JavaScript SDK v4.24.6.

## [1.11.1] - 2023-08-17

### Fixed

- Fixed documentation formatting on npm.

## [1.11.0] - 2023-08-16

### Added

- Add support for having URL parameters on the Web Component and the React Component.

## [1.10.0] - 2023-08-16

### Added

- Add support for hiding the visibility of External IDs by default on the Location Details and Directions page.

## [1.9.4] - 2023-08-07

### Fixed

- Refactored inefficient use of private variable.

## [1.9.3] - 2023-08-03

### Fixed

- Upgraded to MapsIndoors JavaScript SDK v4.24.4 and remove behavior that is now default in the SDK regarding labels for Buildings and Venues.

## [1.9.2] - 2023-08-03

### Fixed

- Fixed `startZoomLevel` query parameter not working on Google Maps.

## [1.9.1] - 2023-08-03

### Fixed

- Fixed error message appearing in weird states on Google Maps.

## [1.9.0] - 2023-08-01

### Added

- Added turn-by-turn directions in folded-out view.

## [1.8.3] - 2023-08-01

### Fixed

- Fixed Floor Selector visibility on the Directions mode.

## [1.8.2] - 2023-08-01

### Fixed

- Fixed search results not being scrollable on Safari.

## [1.8.1] - 2023-08-01

### Fixed

- Fixed My Position button not working on the Wayfinding.

## [1.8.0] - 2023-07-12

### Added

- Upgrade SDK version.

## [1.7.2] - 2023-07-11

### Fixed

- Fix category icons not being shown on the first load.

## [1.7.1] - 2023-07-11

### Fixed

- Replace mapsindoors global variable.

## [1.7.0] - 2023-07-11

### Added

- Implemented the new mi-floor-selector and mi-my-position Web Components for Google Maps.
- New layout for the mi-floor-selector and mi-my-position Web Components for Mapbox and Google Maps.

## [1.6.0] - 2023-07-10

### Added

- Added support for loading MapsIndoors JavaScript SDK if not already available.

## [1.5.1] - 2023-07-10

### Fixed

- Fixed multiple routes shown simultaneously.

## [1.5.0] - 2023-07-07

### Added

- Implemented the new mi-floor-selector and mi-my-position Web Components for Mapbox.

## [1.4.3] - 2023-07-04

### Fixed

- Changed error message on the Wayfinding page.

## [1.4.2] - 2023-07-03

### Fixed

- Fixed visibility of multiple modals.

## [1.4.1] - 2023-07-03

### Fixed

- Upgraded to the latest SDK version.
- Fix typo in the README file.

## [1.4.0] - 2023-07-03

### Added

- Added destination step to the directions.

## [1.3.4] - 2023-06-27

### Fixed

- Fixed "janky" animation on the splash screen.

## [1.3.3] - 2023-06-26

### Fixed

- Removed unwanted visibility of venue and building labels.

## [1.3.2] - 2023-06-26

### Added

- Added support for changing the primary color property throughout the whole app.

## [1.3.1] - 2023-06-14

### Fixed

- Fixed showing error message when no results are found.

## [1.3.0] - 2023-06-12

### Added

- Update UI design throughout the app.

## [1.2.0] - 2023-06-12

### Added

- The Map Template now uses [Recoil](https://recoiljs.org/) to manage state.

### Fixed

- Fix crash in the Wayfinding component when having `My Position` enabled.

## [1.1.1] - 2023-06-08

### Fixed

- Fix missing prop for `startZoomLevel`.

## [1.1.0] - 2023-06-08

### Added

- Support for driving and biking transportation modes.
- Support for having startZoomLevel override locationId property.

### Fixed

- Closing button not being clickable on the Directions page.
- Resizing of the sheet/modal when no categories are set.

