# mi-notification

The `<mi-notification>` element can be used to display a notification.

Working example:

<mi-notification position="bottom-right" duration="6"></mi-notification>
<button onclick="showNotification()">Show notification</button>

<script>
    const miNotificationElement = document.querySelector('mi-notification');

    function showNotification() {
         const notificationTypes = [
            'info',
            'warning',
            'success',
            'error',
            'none'
        ];
        const randomNotificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const notification = {
            message: `Example notification for '${randomNotificationType}' type`,
            type: randomNotificationType,
            sticky: false
        };
        miNotificationElement.push(notification.message, notification.type, notification.sticky);
    }
</script>

Example usage:

```html
<!-- HTML -->

<mi-notification position="bottom-right" duration="6"></mi-notification>
<button onclick="showNotification('Message to display', 'info', false)">Show notification</button>
```

```js
// JavaScript

const miNotificationElement = document.querySelector('mi-notification');

function showNotification(message, notificationType, isSticky) {
    miNotificationElement.push(message, notificationType, isSticky);
}
```

## `position` attribute

A `position` attribute is available on the `<mi-notification>` element, which can be used to set the position of where the notifications should be rendered. Default value is 'bottom-right'.

| Supported positions |
| ------------------- |
| top-left            |
| top-center          |
| top-right           |
| bottom-center       |
| bottom-left         |
| bottom-right        |

## `duration` attribute

A `duration` attribute is available on the `<mi-notification>` element, which can be used to control how many seconds the notifications should be visible before automatically dismissed. Default value is 3 seconds.

## `push` method

A `push` method can be called on the `<mi-notification>` element to show a notification.

The method accepts three arguments:

* `message` - Message as a string eg. `Hello world`.
* `type` - Notification type as a string. It accepts `error`, `info`, `success`, `warning` and `none`. Default value is `none` which shows a notification without an icon.
* `sticky` - `true` or `false` as a Boolean. If `true` the notification will be sticky until cleared manually, otherwise the notification will disappear after the amount of seconds defined by the `duration` attribute. Default value is `false`.

## `clearAll` method

A `clearAll` method can be called on the `<mi-notification>` element to clear all visible notifications.

<!-- markdownlint-disable -->
<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description                                                  | Type                                                                                                                                                                                                                | Default                             |
| ---------- | ---------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `duration` | `duration` | Time the notification should be visible. Default value is 3. | `number`                                                                                                                                                                                                            | `3`                                 |
| `position` | `position` | Where the notifications should be positioned.                | `NotificationPosition.BOTTOM_CENTER \| NotificationPosition.BOTTOM_LEFT \| NotificationPosition.BOTTOM_RIGHT \| NotificationPosition.TOP_CENTER \| NotificationPosition.TOP_LEFT \| NotificationPosition.TOP_RIGHT` | `NotificationPosition.BOTTOM_RIGHT` |


## Methods

### `clearAll() => Promise<void>`

Clear all notifications.

#### Returns

Type: `Promise<void>`



### `push(message: string, type?: string, sticky?: boolean) => Promise<void>`

Show a notification.

#### Returns

Type: `Promise<void>`




----------------------------------------------


