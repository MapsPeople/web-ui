# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2025-12-09

### Added

- Added kiosk prop to MapWrapper and MIMap components
- Added kiosk layout support to MapControls component
- Added TextSizeButton component for adjustable text size
- Added text size button to map controls with conditional rendering
- Added custom zoom controls for Google Maps and Mapbox
- Aligned zoomControls rendering with the rest of the components
- Added enableAccessibilityKioskControls prop to MapControls

### Fixed

- Simplified early returns in MapZoomControls

### Changed

- Refactored map control logic

### Style

- Updated ViewModeSwitch button style for improved accessibility
- Simplified button classes and enhanced MapZoomControl styling

## [1.1.1] - 2025-10-30

### Fixed

- Fixed floor selector logic to be handled by the my-position component

## [1.1.0] - 2025-10-21

### Added

- Added `excludedElements` that controls visibility of elements to be displayed in the `MapControls`

## [1.0.5] - 2025-09-16

### Added

- Added a `customPositionProvider` utility that can be instantiated when a `devicePosition` prop is set. This enables custom device position handling in the map and position button components.
- The `MapControls` component now manages position listeners and will instantiate and synchronize the custom position provider when a device position is provided.

## [1.0.4] - 2025-06-04

## Added

- Add support in MapControls for new View Selector

## [1.0.3] - 2025-05-08

## Added

- Add map controls component

## [1.0.2] - 2025-02-11

## Added

- Add default minimum zoom 14 to mapOptions inside MIMap component.

## [1.0.1] - 2024-12-10

### Fixed

- Issue where a Google Maps map would never declare itself initialized.

## [1.0.0] - 2024-12-10

### Added

- MIMap component to show a MapsIndoors map.
