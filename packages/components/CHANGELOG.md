# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [13.32.0] - 2025-12-11

### Added

- `showFloor` flag for `<mi-location-info>` to conditionally display floor information.

## [13.27.1] - 2025-11-17

### Added

- 'Ride the bus' step for BUSWAY transit type.

## [13.27.0] - 2025-10-30

### Added

- Added Follow mode to my-position component that automatically pans the map and changes floors based on device position updates.
- Added VenueBuilding interface providing complete type definitions for MapsIndoors building objects with floor validation support.

## [13.26.9] - 2025-10-21

### Fixed

- Fixed `InsideBuilding` string that was missing a space.

## [13.26.8] - 2025-10-09

### Fixed

- Fixed position state types being set to requesting when sent position was invalid

## [13.26.7] - 2025-09-16

### Added

- Added a custom position provider example and created a new position provider interface for improved extensibility.
- Refactored the geolocation provider to use the new position provider interface.
- Updated the `mi-my-position` component to support both the legacy geolocation provider and the new position provider interface.

## [13.26.6] - 2025-08-20

### Changed

- Extract geolocation provider into separate module

## [13.26.5] - 2025-06-04

### Changed

- Update puppeteer and postcss to latest version

## [13.26.4] - 2025-05-27

### Changed

- Fixed route instruction step toggle icons

## [13.26.3] - 2025-05-22

### Changed

- Added stopPropagation() to scroll buttons click event to prevent parent element events from firing.

## [13.26.2] - 2025-05-08

### Changed

- Removed floor selector and my-position margin

## [13.26.1] - 2025-04-29

### Changed

- Improved filtering in mi-dropdown component.

## [13.26.0] - 2025-02-20

### Changed

- Removed code responsible for `You have arrived.` last destination step.

## [13.25.0] - 2025-01-29

### Added

- Added prop validation and fixed various eslint rules.

## [13.24.1] - 2024-12-16

### Fixed

- **mi-dropdown**: Fixed a bug where the dropdown button would sometimes appear empty and not display the selected item's value.

## [13.24.0] - 2024-12-16

### Added

- **mi-dropdown**: Added `alignment` attribute to the `mi-dropdown` component. This attribute allows you to set the alignment of the dropdown relative to the dropdown button, with options for `left` or `right`. The default is `left`.

### Changed

- **mi-dropdown**: The `label` attribute on the `mi-dropdown` now also works for non-multi-select dropdowns. If set, its content is always shown as the label on the dropdown button.

## [13.23.0] - 2024-09-19

### Added

- **mi-keyboard**: Support for Dutch keyboard layout.

## [13.22.0] - 2024-09-19

### Added

- `cleared` event emitter to `mi-dropdown` component. It notifies when dropdown search input is cleared.

## [13.21.0] - 2024-09-18

### Added

- `clearFilter` function for `mi-dropdown`.

## [13.20.3] - 2024-09-18

### Added

- Added new property to the `mi-dropdown` component called `placeholder`.

## [13.20.2] - 2024-07-17

### Fixed

- Fixed an issue where clicking the scrollbar of `mi-dropdown` within a modal would unexpectedly close the dropdown.

## [13.20.1] - 2024-06-25

### Fixed

- Adds missing styling for disabled items in a dropdown list.

## [13.20.0] - 2024-06-17

### Added

- **mi-keyboard**: Support added for Italian keyboard layout.

## [13.19.1] - 2024-05-27

### Fixed

- Upgrade dependencies causing vulnerabilities

## [13.19.0] - 2024-04-25

### Added

- Added new properties to the `mi-dropdown-item` component called `excludeFromAll` and `disabled`.
- Extended the `mi-dropdown-item` component's documentation.

## [13.18.0] - 2024-02-26

### Added

- Added a new property to the `mi-data-table` component called page.

## [13.17.1] - 2024-02-06

### Fixed

- Fixed `my-position` component resetting the tilt of the map.

## [13.17.0] - 2024-01-30

### Added

- Adjust `scroll-buttons` component to fit the new design.

## [13.16.0] - 2024-01-22

### Added

- Refactor the `route-instructions-step` component to fit the new design.

## [13.15.2] - 2024-01-22

### Fixed

- **mi-search** Make sure the display text is set on the input element value.

## [13.15.1] - 2024-01-16

### Fixed

- **mi-search** Make sure to use valid language tag when requesting search suggestions from Mapbox.

## [13.15.0] - 2024-01-10

### Added

- Support for using language property on the `mi-keyboard`.
- Add `clearInput()` and `getInputField()` methods.

## [13.14.1] - 2023-12-20

### Fixed

- The `mi-search` component that can now get external location info in any language by using the `language` property.

## [13.14.0] - 2023-11-06

### Added

- Add support for listening to the `floor_changed` event in the `mi-floor-selector` component.
- Add hovering effects on the `mi-list-item-location` component.

## [13.13.0] - 2023-10-09

### Added

- Add support for searching for Mapbox places in the `mi-search` component.

## [13.12.0] - 2023-10-06

### Added

- Add support for setting the compass style when the component has been rendered.

## [13.11.1] - 2023-09-19

### Fixed

- Fixed version number.

## [13.11.0] - 2023-09-19

### Added

- Add support for having `changed` event on the search component.
- A `changed` event will be emitted whenever the valye of the input field is changed.

## [13.10.2] - 2023-09-04

### Fixed

- Fixed documentation for the My Position component.

## [13.10.1] - 2023-09-04

### Fixed

- Fixed My Position URL parameter not working.

## [13.10.0] - 2023-08-01

### Added

- **mi-route-instructions-maneuver** has been renamed to `mi-route-instructions-maneuver-legacy`.
- A new component for the `mi-route-instructions-maneuver` with a new design has been created.

## [13.9.0] - 2023-07-25

### Added

- **mi-location-info** now supports translation of the word 'Level'.

## [13.8.1] - 2023-07-11

### Fixed

- **mi-my-position** is now positioned according to the normal flow of the document.

## [13.7.1] - 2023-07-06

### Fixed

- **mi-my-position** displays user-position in blue color.

## [13.7.0] - 2023-07-06

### Added

- **mi-floor-selector** is a new component for showing a MapsIndoors Floor Selector.
- **mi-my-position** is a new component for showing a MapsIndoors My Position button.

## [13.6.0] - 2023-07-06

### Added

- **mi-list-item-location** implements `showExternalId` property.

## [13.5.0] - 2023-07-03

### Added

- **mi-route-instructions-step** support for `destination` type.

## [13.4.0] - 2023-06-26

### Added

- **mi-chip** added suport for having background color property.

## [13.3.0] - 2023-06-12

### Added

- **mi-chip** hover effects.
- **mi-list-item-location** hover effects.
- **mi-search** show clear button only when the input has a value.

## [13.2.0] - 2023-06-12

### Changed

- **mi-keyboard** moved the backspace character from lower right to upper right corner.

### Added

- **mi-keyboard** now displays `.`, `-` and `&` characters.

## [13.1.0] - 2023-06-08

### Changed

- **mi-route-instructions-step** now supports Biking and Driving transportations modes besides Walking.

## [13.0.6] - 2023-05-26

### Changed

- Updated the reposity release workflow.

## [13.0.0] - 2023-05-11

### Changed

- **mi-route-instructions-step** was changed to a simpler layout. The old layout was moved to **mi-route-instructions-step-legacy**.

### Added

- **mi-chip** is a new component for showing a "chip".
- **mi-location-info** will now show subtitle property if available on the location.
- **mi-list-item-location** `icon` property that can be used to explicitly set the icon.
- **mi-search** now has a `disabled` prop, a `focusInput` method to focus the input field, a `setDisplayText` to override the text content and a `triggerSearch` method to programatically trigger the search.

## [12.2.2] - 2023-02-14

### Added

- **mi-combo-box**: Clicking inside the input field will highlight the text inside.

## [12.2.1] - 2023-02-08

### Added

- **mi-combo-box**: Arrow will open/close dropdown. After a hard refresh, the combo box will not be in focus.

## [12.2] - 2023-02-07

### Added

- **mi-combo-box**: Implemented a new Combo Box component.

## [12.1] - 2023-01-25

### Added

- Support for French (AZERTY) and German (QWERTZ) layout keyboards.

## [12.0.1] - 2022-12-12

### Changed

- Upgrading various dependencies to the latest versions.

## [12.0.0] - 2022-12-08

### Changed

- **mi-map-mapbox**: The Floor Selector is going to be shown all the time, without map interaction.
- **mi-map-googlemaps**: The Floor Selector is going to be shown all the time, without map interaction. The attribute value of `myPositionControlPosition` and `floorSelectorControlPosition` should now be strings corresponding to value of `google.maps.ControlPosition`.

## [11.15.1] - 2022-08-15

### Fixed

- **mi-dropdown**: In Safari dropdown will be closed when clicked outside of the dropdown.

## [11.15.0] - 2022-08-11

### Added

- **mi-column**: `monospace` prop for setting the font-family to monospace.

### Fixed

- **mi-data-table**: Adjustments of row heights to a more sensible, smaller height.

## [11.14.0] - 2022-04-25

### Fixed

- **mi-data-table**: Now sorts numeric values as well as strings.
- **mi-data-table**: The checkbox in the header of the table now has the correct state when selected rows are deleted.

### Added

- **route-instructions-step**: Now supports escalators.

## [11.13.2] - 2022-04-21

### Fixed

- Use font-family property from `midt` in all components

## [11.13.0] - 2022-04-01

### Added

- **mi-dropdown**: Is now aware of its position in the viewport and will adjust the placement of the dropdown accordingly.

## [11.12.2] - 2022-03-29

### Fixed

- **mi-dropdown**: Is now capable of sorting numeric values.
- **mi-dropdown**: When navigating the list using arrow up or down arrow keys, the currently highlighted item is kept in view by scrolling the list.

## [11.12.1] - 2022-03-24

### Fixed

- **mi-tabs**: Now re-renders upon receiving new content.

## [11.12.0] - 2022-03-23

### Added

- **mi-data-table**: Now supports n-depth object traversal so you can dot into objects when binding in the view.

## [11.11.2] - 2022-03-07

### Fixed

- **mi-dropdown**: Prevent the dropdown component to interfere with other scrollable elements.

## [11.11.1] - 2022-02-10

### Added

- **mi-dropdown**: A `disabled` attribute was added.

### Fixed

- **mi-dropdown**: Would throw an error when the `filterable` property wasn't set.

## [11.10.3] - 2022-01-18

### Added

- **mi-dropdown**: Now has support for showing items with icons in the header when single selecting.

## [11.10.1] - 2022-01-18

### Fixed

- **mi-data-table**: It's now possible to select rows when adding data to the table by setting the tables `selected` property.

## [11.10.0] - 2022-01-14

### Added

- **mi-dropdown**: A `button-icon` part attribute to allow external styling of the icon img element.

## [11.9.0] - 2021-12-16

### Added

- **mi-dropdown**: Now has the option to display user-specified text when hovering an `mi-dropdown-item` by setting the `title` attribute.

### Fixed

- **mi-dropdown**: Tabbing to the clear button and pressing Enter would clear the input field and select the highlighted item instead of just clearing the input field.
- **mi-dropdown**: `mi-dropdown-item`s with icons were not filterable.

## [11.8.1] - 2021-12-01

### Changed

- **mi-notification**: Enums and interfaces is now exposed.

## [11.8.0] - 2021-11-17

### Added

- **mi-dropdown**: The items within the content window now truncate long strings, and hovering over items will now show the full text.

## [11.7.1] - 2021-11-10

### Fixed

- **mi-dropdown**: Fuzzy search now correctly shows the items that match the input query the most.

## [11.7.0] - 2021-11-05

### Fixed

- **mi-dropdown**: The clear button in the input field is now hidden and untabable when there's no input string.

## [11.6.2] - 2021-11-02

### Fixed

- **mi-dropdown**: Searching for items now uses a score to show the items that match the search query.

## [11.6.1] - 2021-11-02

### Fixed

- **mi-column**: Styling issue that would cause columns with a fixed width to resize when changing the table width.

## [11.6.0] - 2021-10-29

### Added

- **mi-column**: `alignContent` attribute for setting the alignment of the column's content.
- **mi-column**: `width` attribute for setting a fixed width of the column.

### Fixed

- **mi-data-table**: Styling issue for none-sortable columns that caused extra padding to be applied.

## [11.5.2] - 2021-10-28

### Fixed

- **mi-dropdown**: Using the cursor to select an item was not possible.

## [11.5.1] - 2021-10-28

### Fixed

- **mi-dropdown**: Now shows the selected item again.

## [11.5.0] - 2021-10-28

### Added

- **mi-dropdown**: Now supports navigating and selecting items using the keyboard.

## [11.4.2] - 2021-10-18

### Fixed

- **mi-dropdown**: The dropdown filtering options now got a fixed position.

## [11.4.1] - 2021-10-14

### Fixed

- **mi-dropdown**: The spacing between checkbox and icon is now `12px`.
- **mi-dropdown**: The spacing between the icon and the label is now `8px`.

## [11.4.0] - 2021-10-14

### Added

- **mi-dropdown**: Now has support for adding icons to items. `<mi-dropdown-item value="foo"><img src="example.com/image.png />bar</mi-dropdown-item>`.
- **mi-column**: Now has an `sort` attribute for pre-sorting the table by that column. `sort="asc|desc"`
- **mi-column**: The `sortable` attribute can now take an optional value `"date"` to sort the specific column as dates. `sortable="date"`.

## [11.3.0] - 2021-10-05

### Added

- **mi-dropdown**: Now has an `icon` property, which accepts an image source.
- **mi-dropdown**: Now has an `icon-alt` property, which sets the alternative text for an image.

## [11.2.0] - 2021-09-16

### Added

- **mi-route-instructions**: Support for three new highways that can occur in a route: `ladder`, `wheelchairramp` and `wheelcharlift`.
- **mi-icon**: Icons for `ladder`, `wheelchair-ramp` and `wheelchair-lift`.

## [11.1.0] - 2021-09-15

### Changed

- **mi-list-item-location** and **mi-list-item-category**: Images hosted on `image.mapsindoors.com` are now requested with query parameters for getting the image in the displayed size.

## [11.0.0] - 2021-09-08

### Added

- **mi-data-table**: Now has a `sticky-header` property, which can be used to make the table header non-sticky.

## [10.12.0] - 2021-09-06

### Added

- **mi-tabs**: Now has a `bordered` property, which can be set to add a border surrounding the content view.

## [10.11.0] - 2021-09-01

### Added

- **mi-dropdown**: Now displays a message when no results can be found based on the search query.
- **mi-dropdown**: Now disables the filter select buttons when there's nothing to select.
- **mi-dropdown**: Now performs filtering based on a fuzzy search algorithm.

### Fixed

- mi-dropdown: Filtering within the component now works as expected.

## [10.10.0] - 2021-08-26

### Added

- **mi-data-table**: `emptyPageHeader` and `emptyPageSubheader` properties added which can be used to set the header and subheader that is being presented when the table is empty.

## [10.9.0] - 2021-08-25

### Added

- **mi-dropdown**: `itemsOrder` property added to control the sorting of the dropdown options.

## [10.8.0] - 2021-08-20

### Fixed

- **mi-scroll-buttons**: The state of the up and down buttons now disable or enable correctly when the scrollbar reaches the top or bottom.

## [10.7.0] - 2021-08-16

### Added

- **mi-dropdown**: Option to style icon on the right-hand side of the dropdown component.

### Fixed

- **mi-dropdown**: Dropdown content previously had no max height to prevent it from taking more space than available.

## [10.6.0] - 2021-08-11

### Fixed

- **mi-dropdown**: Collapsing button now has a pre-defined height.

### Added

- **mi-dropdown**: Disabled state for the button when no textual content is available.

## [10.5.1] - 2021-08-03

### Fixed

- **mi-dropdown**: The button will now display the name of the first `mi-dropdown-item` as its content instead of being empty.

## [10.5.0] - 2021-08-03

### Added

- **mi-dropdown**: Option to style the textual content inside the button using document-level CSS.

## [10.4.0] - 2021-07-21

### Added

- **mi-dropdown**: The button can now be styled using document-level CSS.

## [10.3.2] - 2021-07-16

### Fixed

- **mi-dropdown**: The `mi-dropdown-item`'s wasn't rendered when the `items` attribute was an empty array.

## [10.3.1] - 2021-07-15

### Fixed

- **mi-dropdown**: The `mi-dropdown` component didn't render the `mi-dropdown-item` elements when set before the first render.

## [10.3.0] - 2021-07-15

### Added

- **mi-data-table**: The `selectionChanged` event has been added. If the table is selectable this event will fire when the selection changes.

## [10.2.0] - 2021-07-15

### Added

- **mi-column**: The `fit-content` attribute has been added. When present the column width will be fitted to the content.

## [10.1.0] - 2021-07-14

### Added

- **mi-data-table**: The `selectable` attribute has been added. When present on the data-table the first column will be rendered as checkboxes.

## [10.0.0] - 2021-07-07

### Added

- **mi-dropdown**: Documentation added.

### Changed

- **mi-dropdown**: Cleanup of component including look and feel.
- **mi-dropdown**: `change` event now emits selected items instead of the component itself.

## [9.2.0] - 2021-06-17

### Added

- **mi-data-table**: Emit `clicked` event when clickin on elements within table cells.
- **mi-column**: Make it possible to use bindings for boolean HTML attributes within table cells.
- **mi-column**: Make it possible to style elements within table cells with [MIDT helper classes](https://github.com/MapsIndoors/midt) and [MapsIndoors CSS classes](https://github.com/MapsIndoors/css).
- **mi-map-mapbox**: New attribute for setting max pitch (defaults to 60).

### Changed

- **mi-map-mapbox**: Upgrade to use Mapbox GL JS v2.3.0.

## [9.1.0] - 2021-06-10

### Changed

- From previously inserting a script tag manually to now using the [Google Maps JS API Loader](https://www.npmjs.com/package/@googlemaps/js-api-loader) npm package.

## [9.0.2] - 2021-05-06

### Fixed

- Fixed a bug where moving across buildings would show incorrect step heading.

## [9.0.1] - 2021-04-29

### Changed

- Updated the version used of @mapsindoors/typescript-interfaces.

## [9.0.0] - 2021-04-29

### Changed

- Deprecate the following interfaces: Anchor, Building, BuildingInfo, LatLng, DisplayRule, Field, Location, Venue in favor of using the TypeScript interface library @mapsindoors/typescript-interfaces.

## [8.2.3] - 2021-04-29

### Fixed

- **mi-map-googlemaps**: Reduce memory leaks when removing component.
- **mi-map-mapbox**: Reduce memory leaks when removing component.

## [8.2.2] - 2021-04-23

### Added

- **mi-scroll-buttons**: Documentation added.

## [8.2.1] - 2021-04-20

### Fixed

- **mi-route-instructions-step** Replaced the empty circle with the steps action icon. Now showing the steps instruction when available (defaults to action for travel mode).
- **mi-map-mapbox** Removed default maxZoom value of 21. This is handled in the SDK.
- Upgrade to use the latest MapsIndoors JavaScript SDK (v4.7.0) with various bugfixes.
- **mi-share-sms**: Property name changed from `inputPlaceholder` to `input-placeholder`.

## [8.2.0] - 2021-02-23

### Added

- **mi-list-item-location**: Added properties `iconBadge` and `iconBadgeValue` which can be used to add a badge to the icon.

### Changed

- **mi-share-sms**: Documentation updated.
- **mi-location-info**: Documentation updated.
- **mi-step-switcher**: Documentation updated.

## [8.1.0] - 2021-02-15

### Added

- mi-map-googlemaps: `language` property added to set the language of the component. This property is not reactive.
- mi-map-mapbox: `language` property added to set the language of the component. This property is not reactive.

### Fixed

- mi-map-googlemaps: Now checks if an instance of Google Maps API is initialized or not.
- mi-map-googlemaps: Now checks if an instance of the Mapbox API is initialized or not.

## [8.0.0] - 2021-02-08

### Added

- **mi-search**: New custom `shortInput` event.
- **mi-map-googlemaps**: `getDirectionsServiceInstance` method added to expose `DirectionsService` instance.
- **mi-map-googlemaps**: `getDirectionsRendererInstance` method added to expose `DirectionsRenderer` instance.
- **mi-map-mapbox**: `getDirectionsServiceInstance` method added to expose `DirectionsService` instance.
- **mi-map-mapbox**: `getDirectionsRendererInstance` method added to expose `DirectionsRenderer` instance.

### Changed

- **mi-map-googlemaps**: `showRoute`, `setRoute`, `clearRoute`, `nextRouteLeg`, `previousRouteLeg`, `setRouteLegIndex`, and `getRoute` methods is deprecated in favor for new `getDirectionsRendererInstance` and `getDirectionsRendererInstance` methods.
- **mi-map-googlemaps**: Component updated to latests SDK release (V. 4.5.0).
- **mi-map-mapbox**: `showRoute`, `setRoute`, `clearRoute`, `nextRouteLeg`, `previousRouteLeg`, `setRouteLegIndex`, and `getRoute` methods is deprecated in favor for new `getDirectionsRendererInstance` and `getDirectionsRendererInstance` methods.
- **mi-map-mapbox**: Component updated to latests SDK release (V. 4.5.0).
- **RouteParams interface**: Deprecation of `RouteParams` interface.

## [7.3.2] - 2021-02-03

### Changed

- **mi-map-googlemaps**: Default value for `strokeWeight` at the `polygonHighlightOptions` property is changed from 1 to 2.
- **mi-map-mapbox**: Default value for `strokeWeight` at the `polygonHighlightOptions` property is changed from 1 to 2.

## [7.3.1] - 2021-02-02

### Fixed

- **mi-location-booking**: Remove hardcoded participant list for the bookings.

## [7.3.0] - 2021-01-29

### Added

- **mi-location-booking**: New component that can show and perform location bookings.

## [7.2.3] - 2021-01-28

### Changed

- **mi-route-instructions**: Documentation updated.
- **mi-route-instructions-maneuver**: Documentation updated.
- **mi-map-googlemaps**: Component updated to latests SDK release (V. 4.4.0).
- **mi-map-mapbox**: Component updated to latests SDK release (V. 4.4.0).

## [7.2.2] - 2021-01-20

### Added

- **Field Interface**: Export `Field` interface used for `fields` property at `Location` objects.

## [7.2.1] - 2021-01-14

### Fixed

- **mi-route-instructions**: The step toggle didn't show the pointer cursor on hover if the step was active.

## [7.2.0] - 2021-01-14

### Added

- **mi-route-instructions**: Add `activeStep` attribute for visually highlighting of current step.
- **mi-route-instructions**: Add `step` and `active` part attributes for external styling of step element.

## [7.1.3] - 2021-01-13

### Changed

- **mi-map-googlemaps**: Documentation updated.
- **mi-map-mapbox**: Documentation updated.
- **mi-route-instructions-step**: Documentation updated.
- **mi-distance**: Documentation updated.
- **mi-icon**: Documentation updated. Note added regards component not being compatible with IE11.

### Fixed

- **mi-route-instructions**: The translations for "venue" and "building" was missing and can now be added to the `translations` attribute.
- **mi-route-instructions-step**: The translations for "venue" and "building" was missing and can now be added to the `translations` attribute.

## [7.1.2] - 2021-01-06

### Fixed

- **mi-map-googlemaps**: Add missing protocol to URL used for googleMaps API script tag.

## [7.1.1] - 2020-12-15

### Fixed

- **mi-route-instructions-maneuver**: Set `instructions` property as default maneuver and fallback to the `maneuver` property.

## [7.1.0] - 2020-12-14

### Added

- **mi-route-instructions**: `originLocation` and `originName` attributes added.

### Fixed

- **mi-route-instructions-step**: Header saying "Leave" was presented for outdoor to outdoor steps.

## [7.0.0] - 2020-12-11

### Changed

- **mi-route-instructions**: Add a `hideIndoorSubsteps` attribute which can be used to control the visibility of the indoor substeps at the `<mi-route-instructions-step>` element.
- **mi-route-instructions-step**: Add a `hideIndoorSubsteps` attribute which can be used to control the visibility of the indoor substeps.
- **mi-route-instructions-maneuver**: Fallback to `instructions` property value if the `maneuver` property is empty.

### Fixed

- **mi-route-instructions-step**: A solid box was rendered instead of a maneuver icon when the `maneuver` property was empty.

## [6.0.4] - 2020-12-07

### Added

- **mi-route-instructions**: Handles for styleable elements in shadow tree.
- **mi-route-instructions-step**: Handles for styleable elements in shadow tree.
- **mi-route-instructions-maneuver**: Handles for styleable elements in shadow tree.

### Changed

- **mi-step-switcher**: Documentation simplified for styling handles.

## [6.0.3] - 2020-12-03

### Fixed

- **mi-route-instructions-step**: Transit destination wasn't presented.

## [6.0.2] - 2020-12-03

### Changed

- **mi-route-instructions-heading**: Documentation updated.
- **mi-route-instructions**: 'arrive' and 'take' translation strings is deprecated and not longer needed.

### Fixed

- **mi-route-instructions-step**: Transit destination wasn't presented.

## [6.0.1] - 2020-12-02

### Added

- **mi-step-switcher**: Handles for styleable elements in shadow tree.
- **mi-route-instructions**: IE11 support.
- **mi-route-instructions-step**: IE11 support.

## [6.0.0] - 2020-11-30

### Added

- **mi-map-googlemaps**: New map component using Google Maps as map provider and SDK V. 4.1.1.
- **mi-map-mapbox**: Position Control support added.
- **mi-route-instructions-step**: Added missing rendering of transit step.
- **mi-spinner**: Documentation updated.
- **mi-notification**: Documentation updated.
- **mi-map-mapbox**: Documentation added.

### Changed

- **mi-map**: Component deprecated in favor for new `<mi-map-googlemaps>` component.
- **mi-map-mapbox**: The `mapsIndoors` instance is removed from the payload of the `mapsIndoorsReady` event in favor for new `getMapsIndoorsInstance` method.
- **mi-map-mapbox**: Deprecated the following methods: `panTo`, `getBounds`, `fitBounds`, `setDisplayRule`, `setVenue`, `fitVenue`, `filterLocations`, and `clearLocationFilter` in favor for the `getMapInstance` and `getMapsIndoorsInstance` methods.

## [5.0.8] - 2020-11-24

### Fixed

- **mi-route-instructions**: The action name reflects now the proper Enter/Exit step.

### Added

- **mi-route-instructions**: Adds Building or Venue name to step heading.

## [5.0.7] - 2020-11-20

### Added

- **mi-search**: Reflect namespace changes introduced in SDK 4.
- **mi-share-sms**: Reflect namespace changes introduced in SDK 4.

## [5.0.6] - 2020-11-20

### Added

- **mi-route-instructions**: Add default translations for `mi-time` component.
- **mi-time**: Clean up handling of `translations` attribute.

## [5.0.5] - 2020-11-20

### Changed

- **mi-map-mapbox**: Component updated to latests SDK release (V. 4.1.1).

## [5.0.4] - 2020-11-19

### Added

- **mi-time**: `translations` attributes is added.
- **mi-keyboard**: Support added for `da-DK` browser language.

### Changed

- **mi-keyboard**: Documentation update.
- **mi-search**: The fixed height of the component is removed.
- **mi-search**: Documentation update.

## [5.0.3] - 2020-11-18

### Added

- **mi-keyboard**: Documentation update with sample usage and working example.
- **mi-route-instructions**: Documentation update to describe the clicked event.

### Fixed

- **mi-map-mapbox**: Component updated to latests SDK release (V. 4.1.0).
- **mi-route-instructions**: Unit property wasn't reflected in child components.

## [5.0.2] - 2020-11-03

### Added

- **mi-icon**: Printer icon added.

## [5.0.1] - 2020-10-30

### Added

- **mi-route-instructions**: New component displaying MapsIndoors route instructions.

## [5.0.0] - 2020-10-28

### Changed

- **mi-map-mapbox**: `highlightLocation` method is made public.
- **mi-map-mapbox**: `clearPolygonHighlight` method is renamed to `clearHighlightLocation`.

## [3.2.2] - 2020-09-30

### Added

- **mi-map-mapbox**: New map component using Mapbox as map provider and the SDK v.4 alpha 7.

### Changed

- Initial load url for dev server is changed to components.html.

## [3.2.1] - 2020-09-03

### Fixed

- **mi-search**: Fixed bug where clearing search field could cause similar subsequent search to fail.

## [3.2.0] - 2020-09-02

### Fixed

- **mi-scroll-buttons**: Changed the styling of the button container.

### Added

- **mi-search**: Expose a `mi-venue` prop to restrict MapsIndoors search results to a specific venue.

## [3.1.0] - 2020-08-31

### Fixed

- **mi-search**: The clear button is now always visible in the right side on the input field no matter what browser is used.

### Added

- **mi-map**: Location polygon is highlighted when clicked. The highlight can be cleared using the `clearPolygonHighlight` method, and styling of the highlight can be controlled with the `polygonHighlightOptions` prop.

## [3.0.1] - 2020-08-14

### Fixed

- **mi-location-info**: details string wasn't returned when the venue and building was named the same.
- **mi-keyboard**: eventListener was attached multiple times.

### Added

- **mi-keyboard**: custom `inputCleared` event listener.

## [3.0.0] - 2020-08-13

### Fixed

- **mi-location-info**: details for outdoor locations wasn't shown.

### Changed

- **mi-keyboard**: some breaking changes was introduced for better control of when the keyboard should be visible. A layout and inputElement property is added.
- **mi-share-sms**: necessary changes to reflect changes made in mi-keyboard component.

## [2.4.0] - 2020-08-07

### Added

- **New**: mi-share-sms component.

### Fixed

- **mi-map**: didn't show any locations until the map had been idle.
- **mi-card**: had a unnecessary div tag which in some cases did cause trouble.

### Changed

- Upgrade to MapsIndoors JS SDK version 3.11.0.

## [2.3.1] - 2020-07-29

### Fixed

- **mi-search**: fixed `mi-near` to provide correctly formatted data to the SDK.

## [2.3.0]

### Added

- **mi-search**: added a componentRendered event.

## [2.2.0]

### Added

- **mi-search**: added a idAttribute and dataAttributes attribute.

## [2.1.2]

### Fixed

- **mi-keyboard**: added a "same element" check to handleFocusin method.

## [2.1.1]

### Fixed

- **mi-step-switcher**: adjusted the vertical padding.

## [2.1.0]

### Added

- **New**: mi-step-switcher component.

## [2.0.0]

### Added

- Changelog.

### Changed

- Switched to semantic versioning.
- **mi-search**: disabled browser autocomplete.
- **mi-search**: style changes for a larger appearance.
- **mi-keyboard**: removed the enter key from the keyboard layouts.
- **mi-list-item-location**: vertically centering.

### Fixed

- **mi-location-info**: removed alike building names.
- **mi-keyboard**: when clicking outside the keyboard to dismiss it now exposes the correct click target.
- **mi-list**: fixed reference bug.
