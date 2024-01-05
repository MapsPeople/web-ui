# mi-search

The `<mi-search>` element can be used to search for locations in a MapsIndoors solution and/or Google Places. `mapsindoors` is required in the global scope.

Working example:

<mi-search gm-country-code="dk" mapsindoors="true" google="true" placeholder="Start typing to search&hellip;" style="height: 48px"></mi-search>

<div id="results" style="max-width: 34rem; max-height:200px; overflow-y: scroll;"></div>

<script>
    const miSearch = document.querySelector('mi-search');
    const resultsContainer = document.getElementById('results')
    miSearch.addEventListener('results', e => {
        resultsContainer.innerHTML = '';
        for (const result of e.detail) {
            const resultNode = document.createElement('p');
            resultNode.innerHTML = `${result.properties.type} - ${result.properties.name}`;
            resultsContainer.appendChild(resultNode);
        }
    });
    miSearch.addEventListener('cleared', () => {
        resultsContainer.innerHTML = '';
    });
</script>

<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?libraries=geometry,places&key=AIzaSyBNhmxW2OntKAVs7hjxmAjFscioPcfWZSc"></script>
<script type="text/javascript" src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.13.0/mapsindoors-4.13.0.js.gz?apikey=mapspeople"></script>

Example usage:

```html
<!-- HTML -->

<mi-search
    mapsindoors="true"
    google="true"
    gm-country-code="dk"
    placeholder="Search"
></mi-search>
```

```js
// JavaScript

const miSearch = document.querySelector('mi-search');
miSearch.addEventListener('results', (event) =>
    console.log('Search results', event.detail);
);
```

## `mapsindoors` attribute

A `mapsindoors` attribute is available on the `<mi-search>` element. Set this to `true` if searching should include results for MapsIndoors locations. Default is `false`.

## `google` attribute

A `google` attribute is available on the `<mi-search>` element. Set this to `true` if searching should include results from Google Places autocomplete service. Default is `false`.
The Google Maps API is required with Google Places library enabled.

## `value` attribute

A `value` attribute is available on the `<mi-search>` element, which can be used to a) Read the currently entered input field value, b) set the value of the search field (thus initializing search with that value).

## `disabled` attribute

A `disabled` attribute is available on the `<mi-search>` element, which can be use to make the search field disabled.

## `idAttribute` attribute

A `idAttribute` attribute is available on the `<mi-search>` element, which can be used to set a `id` attribute on the `<mi-search>` components input element.

## `dataAttributes` attribute

A `dataAttributes` attribute is available on the `<mi-search>` element, which can be used to set a list of data attributes on the `<mi-search>` component's `input` element.

```html
<!-- HTML -->

<mi-search></mi-search>
```

```js
// JavaScript

const dataAttributes = { 'data-keyboard': 'alphabetic' };
const miSearch = document.querySelector('mi-search');
miSearch.dataAttributes = dataAttributes;
```

## `miFields` attribute

A `miFields` attribute is available on the `<mi-search>` element, which can be used to specify what fields on MapsIndoors locations to search in. The attribute value must be a comma separated string of fields. Default (if not set) is `name,description,aliases,categories,externalId`.

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-fields="aliases,externalId"></mi-search>
```

## `miTake` attribute

A `miTake` attribute is available on the `<mi-search>` element, which can be used to specify how many MapsIndoors search results to receive.

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-take="5"></mi-search>
```

## `miSkip` attribute

A `miSkip` attribute is available on the `<mi-search>` element, which can be used to specify how many MapsIndoors search to skip ahead before receiving results. Combine with the `miTake` attribute for pagination.

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-take="5" mi-skip="10"></mi-search>
```

## `miOrder` attribute

A `miOrder` attribute is available on the `<mi-search>` element, which can be used to specify the order of the returned MapsIndoors locations search.

You can either sort by “relevance” or by specifying location property keys (like "`name`","`building`","`floor`" etc.). Direction can be enforced by adding "`asc`" or "`desc`" as a second search parameter eg. "`building,asc`"

Default value: `name,desc`

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-order="building,asc"></mi-search>
```

## `miCategories` attribute

A `miCategories` attribute is available on the `<mi-search>` element, which can be used to restrict MapsIndoors location searches to one or more Categories. The attribute value must be a comma separated list of Categories. Default (if not set) is not to restrict searches by any categories.

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-categories="toilet,office"></mi-search>
```

## `miVenue` attribute

A `miVenue` attribute is available on the `<mi-search>` element, which can be used to restrict MapsIndoors Location searches to a specific Venue. The attribute value can be given as either `venue id` or `venue name`.

The following is expected:

-   When set, any MapsIndoors location searches will return results only within the given Venue.

## `miNear` attribute

A `miNear` attribute is available on the `<mi-search>` element, which can be used to instruct MapsIndoors location searching to prefer locations near a point.

The point can either be a latitude-longitude coordinate pair as a string, eg. "`-12.3456,45.6789`" or a string in the format "`type:id`" e.g. "`venue:586ca9f1bc1f5702406442b6`".

```html
<!-- HTML -->

<mi-search mapsindoors="true" mi-near="-12.3456,45.6789"></mi-search>
```

## `gmCountryCode` attribute

A `gmCountryCode` attribute is available on the `<mi-search>` element, which can be used to restrict Google Places searches to a specific country. Use a two-character, ISO 3166-1 Alpha-2 compatible country code.

## `results` event

A `results` event is emitted from the `<mi-search>` element whenever searching is complete. The `event.detail` property holds an array of locations. This may be empty if no results are found.

## `cleared` event

A `cleared` event is emitted from the `<mi-search>` element whenever the input field value is emptied.

## `componentRendered` event

A `componentRendered` event is emitted from the `<mi-search>` element after every component rendering.

## `shortInput` event

A `shortInput` event is emitted from the `<mi-search>` element whenever the search field contains only one character.

## `clear` method

A `clear` method can be called on the `<mi-search>` element to clear the input field.

```js
// Javascript

const miSearch = document.querySelector("mi-search");
miSearch.clear();
```

## `focusInput` method

A `focusInput` method can be called on the `<mi-search>` element to apply focus to the input element.

## `setDisplayText` method

A `setDisplayText` method can be called on the `<mi-search>` element to override the text in the input field.

## `triggerSearch` method

A `triggerSearch` method can be called on the `<mi-search>` element to programatically trigger a search.



<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property         | Attribute         | Description                                                                                                                                                                                                                                                           | Type                         | Default                                            |
| ---------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| `dataAttributes` | --                | Data attributes for the input field.                                                                                                                                                                                                                                  | `{ [key: string]: string; }` | `{}`                                               |
| `disabled`       | `disabled`        | Make the search field disabled                                                                                                                                                                                                                                        | `boolean`                    | `false`                                            |
| `gmCountryCode`  | `gm-country-code` | Restrict Google Places search to a specific country (two-character, ISO 3166-1 Alpha-2 compatible country code)                                                                                                                                                       | `string`                     | `undefined`                                        |
| `google`         | `google`          | If searching should include Google Places autocomplete suggestions.  Remember to comply to Google's policy by showing a "Power By Google" badge somewhere on your page if not already showing a Google map: https://developers.google.com/places/web-service/policies | `boolean`                    | `false`                                            |
| `idAttribute`    | `id-attribute`    | Id for the input field.                                                                                                                                                                                                                                               | `string`                     | `''`                                               |
| `language`       | `language`        | The language used when retrieving Google Places or Mapbox autocomplete suggestions.                                                                                                                                                                                   | `string`                     | `'en'`                                             |
| `mapbox`         | `mapbox`          | If searching should include Mapbox autocomplete suggestions.                                                                                                                                                                                                          | `boolean`                    | `false`                                            |
| `mapsindoors`    | `mapsindoors`     | If searching should include MapsIndoors locations.                                                                                                                                                                                                                    | `boolean`                    | `false`                                            |
| `miCategories`   | `mi-categories`   | Search only Mapsindoors locations within given categories. Accepts comma separated list of categories, eg. 'toilet,office'                                                                                                                                            | `string`                     | `undefined`                                        |
| `miFields`       | `mi-fields`       | Which fields on MapsIndoors locations to search in. Comma separated string.                                                                                                                                                                                           | `string`                     | `'name,description,aliases,categories,externalId'` |
| `miNear`         | `mi-near`         | Search for MapsIndoors locations near a point. Can either be lat,lng coordinate as a string, eg. '-12.3456,45.6789' or a string in the format "type:id" e.g. "venue:586ca9f1bc1f5702406442b6"                                                                         | `string`                     | `undefined`                                        |
| `miOrder`        | `mi-order`        | Specify Mapsindoors search ordering                                                                                                                                                                                                                                   | `string`                     | `undefined`                                        |
| `miSkip`         | `mi-skip`         | Tell Mapsindoors to skip a number of results. Combine with miTake for pagination purposes.                                                                                                                                                                            | `number`                     | `undefined`                                        |
| `miTake`         | `mi-take`         | Restrict how many Mapsindoors results to request.                                                                                                                                                                                                                     | `number`                     | `undefined`                                        |
| `miVenue`        | `mi-venue`        | Restrict search results to a speficic venue (id or name)                                                                                                                                                                                                              | `string`                     | `undefined`                                        |
| `placeholder`    | `placeholder`     | Placeholder for the input field.                                                                                                                                                                                                                                      | `string`                     | `''`                                               |
| `sessionToken`   | `session-token`   | The Mapbox Session Token used for getting Mapbox autocomplete suggestions.                                                                                                                                                                                            | `string`                     | `undefined`                                        |
| `userPosition`   | `user-position`   | The user position which can determine the proximity for the Mapbox places results.                                                                                                                                                                                    | `string`                     | `undefined`                                        |
| `value`          | `value`           | Get or set the entered value                                                                                                                                                                                                                                          | `string`                     | `undefined`                                        |


## Events

| Event               | Description                                                          | Type                    |
| ------------------- | -------------------------------------------------------------------- | ----------------------- |
| `changed`           | Event emitted whenever the value of the input field has changed.     | `CustomEvent<void>`     |
| `cleared`           | Event emitted when the search field is emptied.                      | `CustomEvent<void>`     |
| `componentRendered` | Event emitted after every component rendering.                       | `CustomEvent<void>`     |
| `results`           | Event emitted when searching is complete.                            | `CustomEvent<object[]>` |
| `shortInput`        | Event emitted whenever the search field contains only one character. | `CustomEvent<void>`     |


## Methods

### `clear() => Promise<void>`

Clear the input field.

#### Returns

Type: `Promise<void>`



### `focusInput() => Promise<void>`

Set focus on the input field.
The preventScroll boolean is passed as true to prevent the browser
from scrolling the document to bring the newly-focused element into view.

#### Returns

Type: `Promise<void>`



### `getInputField() => Promise<HTMLInputElement>`

Get hold of the search input field.

#### Returns

Type: `Promise<HTMLInputElement>`



### `setDisplayText(displayText: string) => Promise<void>`

Sets text to be shown in the search field.
Setting it will not perform a search.

#### Returns

Type: `Promise<void>`



### `triggerSearch() => Promise<void>`

Programmatically trigger the search.

#### Returns

Type: `Promise<void>`




----------------------------------------------


