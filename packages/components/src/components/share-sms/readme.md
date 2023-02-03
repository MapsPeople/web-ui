# share-sms

The `<mi-share-sms>` element can be used for sending a pre-generated direction route link to a phone number. The element requires an instance of mapsindoors to be defined and the MapsIndoors SMS add-on enabled.

Working example <i>(The send SMS functionality is not enabled)</i>:

<mi-share-sms
    style="display: block; width: 400px;"
    venue="899cf628675f4b0695669529"
    origin="55b732c2607d436594577bf6"
    destination="8b4e9890e3d048be81dcb36d">
</mi-share-sms>

<script>
    const miShareSmsElement = document.querySelector('mi-share-sms');
    miShareSmsElement.addEventListener('successfullySent', event => {
        alert('Success')
    });

    miShareSmsElement.addEventListener('unsuccessfullySent', event => {
        alert(event.detail)
    });
</script>

Example usage:

```html
<!-- HTML -->

<mi-share-sms
    venue="899cf628675f4b0695669529"
    origin="55b732c2607d436594577bf6"
    destination="8b4e9890e3d048be81dcb36d">
</mi-share-sms>
```

```js
// JavaScript

const miShareSmsElement = document.querySelector('mi-share-sms');
miShareSmsElement.addEventListener('successfullySent', event => {
    alert('Success')
});

miShareSmsElement.addEventListener('unsuccessfullySent', event => {
    alert(event.detail)
});
```

## `venue` attribute

A `venue` attribute is available on the `<mi-share-sms>` element which should be used to set the `venue` id. The attribute is required.

## `origin` attribute

An `origin` attribute is available on the `<mi-share-sms>` element which should be used to specify the `origin` location id. The attribute is required.

## `destination` attribute

A `destination` attribute is available on the `<mi-share-sms>` element which should be used to specify the `destination` location id. The attribute is required.

## `countryCode` attribute

A `countryCode` attribute is available on the `<mi-share-sms>` element which should be used to specify the default country code without the plus sign (+). The default value is "1".

## `inputPlaceholder` attribute

An `inputPlaceholder` attribute is available on the `<mi-share-sms>` element which should be used to specify the placeholder text for the phone number input field. The default value is "Enter phone number".

## `submitButtonLabel` attribute

A `submitButtonLabel` attribute is available on the `<mi-share-sms>` element which should be used to specify the label for the submit button. The default value is `Send SMS`.

## `successfullySent` event

A `successfullySent` event is emitted from the `<mi-share-sms>` element whenever a SMS is successfully sent.

## `unsuccessfullySent` event

A `unsuccessfullySent` event is emitted from the `<mi-share-sms>` element whenever a SMS is unsuccessfully sent. This event includes a detailed error message.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property                      | Attribute             | Description                                    | Type     | Default                |
| ----------------------------- | --------------------- | ---------------------------------------------- | -------- | ---------------------- |
| `countryCode`                 | `country-code`        | Default value for country code input field.    | `string` | `'1'`                  |
| `destinationLocationId`       | `destination`         | MapsIndoors id for destination location.       | `string` | `undefined`            |
| `originLocationId`            | `origin`              | MapsIndoors id for origin location.            | `string` | `undefined`            |
| `phoneNumberInputPlaceholder` | `input-placeholder`   | Placeholder text for phone number input field. | `string` | `'Enter phone number'` |
| `submitButtonLabel`           | `submit-button-label` | Label for submit button.                       | `string` | `'Send SMS'`           |
| `venueId`                     | `venue`               | MapsIndoors venue id.                          | `string` | `undefined`            |


## Events

| Event                | Description                                     | Type                  |
| -------------------- | ----------------------------------------------- | --------------------- |
| `successfullySent`   | Emits a success event when the SMS is send.     | `CustomEvent<any>`    |
| `unsuccessfullySent` | Emits a error message when the SMS wasn't send. | `CustomEvent<string>` |


----------------------------------------------


