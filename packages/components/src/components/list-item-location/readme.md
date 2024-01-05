# mi-list-item-location

The `<mi-list-item-location>` element can be used to display information about a MapsIndoors Location.

Working example:

<mi-list-item-location></mi-list-item-location>

<script src="https://app.mapsindoors.com/mapsindoors/js/sdk/4.13.0/mapsindoors-4.13.0.js.gz"></script>
<script>
    mapsindoors.MapsIndoors.setMapsIndoorsApiKey('demo');
    mapsindoors.services.LocationsService.getLocation('337006664e044df99916054c')
        .then(location => {
            location.properties.imageURL = 'https://app.mapsindoors.com/mapsindoors/cms/assets/icons/building-icons/hall.png';
            document.querySelector('mi-list-item-location').location = location;
            document.querySelector('mi-list-item-location').showExternalId = false;
        });
</script>

Example usage:

```html
<!-- HTML -->
<mi-list-item-location></mi-list-item-location>
```

```js
 mapsindoors.services.LocationsService.getLocation('337006664e044df99916054c')
    .then(location => {
        location.properties.imageURL = 'https://app.mapsindoors.com/mapsindoors/cms/assets/icons/building-icons/hall.png';
        document.querySelector('mi-list-item-location').location = location;
        document.querySelector('mi-list-item-location').showExternalId = false;
    });
```

## `location` attribute

A `location` attribute is available on the `<mi-list-item-location>` element, which should be used to set the MapsIndoors Location to display information for. The attribute is required.

## `showExternalId` attribute

If false, the component will not show the location's Extrenal ID. The attribute is not required. If not set, it will default to true.

## `unit` attribute

A `unit` attribute is available on the `<mi-list-item-location>` element, which can be used to specify the unit the location distance (if any) should be displayed in.

It accepts the following values:

* `imperial`
* `metric`

If no value is given it will default to metric unless the browser is running US English. In that case if will default to imperial.

## `iconBadge` attribute

If given, the component will add a badge to the location image.
Possible values:

* `availability`
* `occupancy`

## `iconBadgeValue` attribute

In combination with the `iconBadge` attribute, the value of the `iconBadgeValue` will be used to determine the content of the badge.

* For `availability`: Possible values are `"true"` and `"false"`.
* For `occupancy`: Any string.

## `locationClicked` event

A `locationClicked` event is emitted from the `<mi-list-item-location>` element when it is clicked.

## `listItemDidRender` event

A `listItemDidRender` event is emitted from the `<mi-list-item-location>` element when is has been rendered.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                      | Type                                       | Default     |
| ---------------- | ------------------ | -------------------------------- | ------------------------------------------ | ----------- |
| `icon`           | `icon`             |                                  | `string`                                   | `undefined` |
| `iconBadge`      | `icon-badge`       |                                  | `string`                                   | `undefined` |
| `iconBadgeValue` | `icon-badge-value` |                                  | `string`                                   | `undefined` |
| `level`          | `level`            |                                  | `string`                                   | `'Level'`   |
| `location`       | `location`         |                                  | `any`                                      | `undefined` |
| `showExternalId` | `show-external-id` | Whether to show the External ID. | `boolean`                                  | `true`      |
| `unit`           | `unit`             |                                  | `UnitSystem.Imperial \| UnitSystem.Metric` | `undefined` |


## Events

| Event               | Description | Type               |
| ------------------- | ----------- | ------------------ |
| `listItemDidRender` |             | `CustomEvent<any>` |
| `locationClicked`   |             | `CustomEvent<any>` |


----------------------------------------------


