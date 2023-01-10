# step-switcher

The `<step-switcher>` element can be used to present controls for navigating between all kind of steps eg. directions steps.

Working example:

<mi-step-switcher style="width:300px;" heading="Steps" step-index="0"></mi-step-switcher>
<script>
    const stepSwitcherElement = document.querySelector('mi-step-switcher');
    const steps = [
        { title: 'Step 0' },
        { title: 'Step 1' },
        { title: 'Step 2' }
    ];
    stepSwitcherElement.steps = steps;
</script>

Example usage:

```html
<!-- HTML -->

<mi-step-switcher heading="Steps" step-index="0"></mi-step-switcher>
```

```js
// JavaScript

const stepSwitcherElement = document.querySelector('mi-step-switcher');
const steps = [
    { title: 'Step 0' },
    { title: 'Step 1' },
    { title: 'Step 2' }
];
stepSwitcherElement.steps = steps;
```

## `stepIndexChanged` event

A `stepIndexChanged` event is emitted from the `<mi-step-switcher>` element whenever a new step is set. The event payload contains the new step index.

Example:

```js
// JavaScript

const stepSwitcherElement = document.querySelector('mi-step-switcher');
stepSwitcherElement.addEventListener('stepIndexChanged', event => {
    console.log(event.detail); // Expected output: 1
});
```

## `steps` attribute

A `steps` attribute is available on the `<mi-step-switcher>` element which can be used to set an array of eg. steps. The attribute accepts all kinds of arrays and doesn't need to be used for directions steps only. When set, a corresponding amount of dots are shown in the middle below the heading. The next and previous buttons can be used to navigate between the steps.

## `heading` attribute

A `heading` attribute is available on the `<mi-step-switcher>` element which can be used to set the heading for the step switcher. When set a heading will be shown above the dots.

## `stepIndex` attribute

A `stepIndex` attribute is available on the `<mi-step-switcher>` element which can be used to set a start index or get the current step index as a number. When set, the dot with active state will correspond to the `stepIndex` value. The default value is 0.

## Styling

On [modern browsers](https://caniuse.com/?search=%3A%3Apart), parts of the component style can be overridden using the CSS pseudo element `::part`.

The following parts are available for styling:

- `heading`: Styles the paragraph element which contains the heading text.
- `active-dot`: Styles the dot for the active step
- `dot`: Styles the dots for inactive steps

### Styling example

```css
/* CSS */

mi-step-switcher::part(dot) {
    background-color: #2a844e;
}
mi-step-switcher::part(active-dot) {
    background-color: #1a5130;
}
```

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property    | Attribute    | Description                                 | Type     | Default     |
| ----------- | ------------ | ------------------------------------------- | -------- | ----------- |
| `heading`   | `heading`    | Heading to display.                         | `string` | `undefined` |
| `stepIndex` | `step-index` | Step index to show. Defaults to first step. | `number` | `0`         |
| `steps`     | --           | Steps to display dots for.                  | `any[]`  | `[]`        |


## Events

| Event              | Description                           | Type                  |
| ------------------ | ------------------------------------- | --------------------- |
| `stepIndexChanged` | Emits the new step index as a number. | `CustomEvent<number>` |


## Shadow Parts

| Part        | Description |
| ----------- | ----------- |
| `"heading"` |             |


----------------------------------------------


