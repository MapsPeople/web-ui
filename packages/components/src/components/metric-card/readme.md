# mi-metric-card

<div style="display: inline-block;">
<mi-metric-card label="Card 1" value="123457" tip="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ultricies magna eget sem tincidunt maximus." style="float: left;"></mi-metric-card>
<mi-metric-card label="Card 2" value="234578" tip="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ultricies magna eget sem tincidunt maximus." style="float: left;"></mi-metric-card>
<mi-metric-card label="Card 3" spinner tip="Lorem ipsum dolor sit amet, consectetur adipiscing elit." style="float: left;"></mi-metric-card>
<mi-metric-card label="Card 4" error="No data avalible." tip="Lorem ipsum dolor sit amet, consectetur adipiscing elit." style="float: left;"></mi-metric-card>
</div>

```html
<mi-metric-card label="Total venues" value="23456" spinner error="Data not avalible"></mi-metric-card>
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description                                                                                                                                     | Type      | Default     |
| --------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------- |
| `error`   | `error`   | This can be used for displaying an error message if there are no data to be displayed.                                                          | `string`  | `undefined` |
| `label`   | `label`   | This is the metric title.                                                                                                                       | `string`  | `''`        |
| `spinner` | `spinner` | When present a loading spinner will be displayed until the value or error attribute is set or the spinner attribute is removed                  | `boolean` | `false`     |
| `tip`     | `tip`     | When present a info icon will be shown in the upper right corner of the card. When the mouse hovers over the icon tooltip will display the tip. | `string`  | `undefined` |
| `value`   | `value`   | This is the metric value.                                                                                                                       | `string`  | `''`        |


----------------------------------------------


