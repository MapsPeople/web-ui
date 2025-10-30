# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2025-10-21

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
