# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.31.2] - 2024-01-23

### Fix

- Fixed the directions not working on a mobile device.

## [1.31.1] - 2024-01-22

### Fix

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

