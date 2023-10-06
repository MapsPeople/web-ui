# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
