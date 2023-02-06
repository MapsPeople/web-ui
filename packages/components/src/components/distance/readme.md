# mi-distance

The `<mi-distance>` element can be used to display a distance in either metric or imperial units.

Working example:

<mi-distance style="display: block" meters="10" unit="imperial"></mi-distance>

Example usage:

```html
<!-- HTML -->

<mi-distance meters="10" unit="imperial"></mi-distance>
```

## `meters` attribute

A `meters` attribute is available on the `<mi-distance>` element, which can be used to pass a value in meters. The minimum display value is 1 unit.

## `unit` attribute

A `unit` attribute is available on the `<mi-distance>` element which can be used to control how distances are presented. Possible values are `metric` (which will show distances in meters and km) and `imperial` (which will show distances in feet and miles). Default value is `metric`.

It will default to metric unless the browser is running US English. In that case if will default to imperial.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                                                                                       | Type                                       | Default                                                                    |
| -------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------- |
| `meters` | `meters`  | Distance in meters.                                                                                                               | `number`                                   | `undefined`                                                                |
| `unit`   | `unit`    | Set imperial or metric as default unit system. Default is Metric unless the browser is running US English. In that case Imperial. | `UnitSystem.Imperial \| UnitSystem.Metric` | `navigator.language === 'en-US' ? UnitSystem.Imperial : UnitSystem.Metric` |


----------------------------------------------


