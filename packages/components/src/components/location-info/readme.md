# mi-location-info

The `<mi-location-info>` element can be used to display a locations External Id, Floor Name, Building, and Venue information.

Working example:

<mi-location-info></mi-location-info>
<script>
const locationInfoComponent = document.querySelector('mi-location-info');
const mockLocation = {
    properties: {
        externalId: "012345",
        floorName: "1",
        building: "The White House",
        venue: "The White House"
    }
}
locationInfoComponent.location = mockLocation;
locationInfoComponent.showExternalId = false;
</script>

Example usage:

```html
<!-- HTML -->

<mi-location-info></mi-location-info>
```

```js
// JavaScript

const locationInfoComponent = document.querySelector('mi-location-info');
const mockLocation = {
    properties: {
        externalId: "012345",
        floorName: "1",
        building: "The White House",
        venue: "The White House"
    }
}
locationInfoComponent.location = mockLocation;
locationInfoComponent.showExternalId = false;
```

## `location` attribute

A `location` attribute is available on the `<mi-location-info>` element which should be used to pass a MapsIndoors `Location`. When the `Building` and `Venue` names is alike only the name of the `Venue` is displayed. The attribute is required.

## `showExternalId` attribute

If false, the component will not show the location's Extrenal ID. The attribute is not required.  If not set, it will default to true.

## `showFloor` attribute

If false, the component will not show the location's floor name. The attribute is not required.  If not set, it will default to true.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description | Type      | Default     |
| ---------------- | ------------------ | ----------- | --------- | ----------- |
| `level`          | `level`            |             | `string`  | `'Level'`   |
| `location`       | `location`         |             | `any`     | `undefined` |
| `showExternalId` | `show-external-id` |             | `boolean` | `true`      |
| `showFloor`      | `show-floor`       |             | `boolean` | `true`      |


----------------------------------------------


