import { Component, h, Prop, Method, Host, JSX, forceUpdate, Element } from '@stencil/core';
import { NotificationPosition } from '../../enums/notification-position.enum';
import { NotificationType } from '../../enums/notification-type.enum';
import { NotificationMessage } from '../../types/notification-message.interface';

@Component({
    tag: 'mi-notification',
    styleUrl: 'notification.scss',
    shadow: true
})
export class Notification {

    /**
     * Host element containing the component.
     *
     * @type {HTMLElement}
     */
    @Element() hostElement: HTMLElement;

    /**
     * Where the notifications should be positioned.
     *
     * @type {NotificationPosition}
     */
    @Prop() position: NotificationPosition = NotificationPosition.BOTTOM_RIGHT;

    /**
     * Time the notification should be visible. Default value is 3.
     *
     * @type {number} - Duration in seconds.
     */
    @Prop() duration: number = 3;

    /**
     * List of currently displayed notifications.
     *
     * @type {NotificationMessage[]}
     */
    notifications: NotificationMessage[] = [];

    /**
     * Used for setting a unique identifier for each notification.
     *
     * @type {number}
     */
    notificationId: number = 0;

    /**
     * Show a notification.
     *
     * @param {string} message - Message to display.
     * @param {string} [type='none'] - Type of notification. Available types: 'info', 'warning', 'success', 'error' and 'none'.
     * @param {boolean} [sticky=false] - Set message as sticky to prevent it from disappearing.
     * @returns {Promise<void>}
     */
    @Method()
    public async push(message: string, type: string = 'none', sticky: boolean = false): Promise<void> {
        if (typeof message !== 'string' || message.length < 1) {
            return;
        }

        // Check validity of type
        const typeExist = Object.values(NotificationType)
            .some((notificationType: string): boolean => notificationType === type);
        if (!typeExist) {
            // eslint-disable-next-line no-console
            console.error('Invalid notification type');
            return;
        }

        const notificationMessage: NotificationMessage = {
            id: this.notificationId,
            message: message,
            sticky: sticky,
            type: type as NotificationType,
        };

        if (sticky === false) {
            notificationMessage.timer = window.setTimeout(() => this.dismiss(notificationMessage.id), (this.duration * 1000));
        }

        this.notificationId++;
        this.notifications.push(notificationMessage);
        forceUpdate(this.hostElement);
    }

    /**
     * Clear all notifications.
     *
     * @returns {Promise<void>}
     */
    @Method()
    public async clearAll(): Promise<void> {
        this.notifications = [];
        forceUpdate(this.hostElement);
    }

    /**
     * Dismiss a single notification.
     *
     * @param {number} id
     */
    dismiss(id: number): void {
        this.notifications = this.notifications.filter((notification): boolean => notification.id !== id);
        forceUpdate(this.hostElement);
    }

    render(): JSX.Element {
        return (
            <Host class={this.position}>
                {this.notifications.map((notification) =>
                    this.renderNotification(notification)
                )}
            </Host>
        );
    }

    /**
     * Get JSX for notification.
     *
     * @param {NotificationMessage} { id, message }
     * @returns {JSX.Element}
     */
    renderNotification({ id, message, type }: NotificationMessage): JSX.Element {
        return (
            <div class="notification" role="alert">
                {type && type !== 'none' ? this.renderIcon(type) : null}
                <p class="label">{message}</p>
                <button
                    type="button"
                    aria-label="Dismiss notification"
                    class="btn"
                    onClick={() => this.dismiss(id)}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                        <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="#1E2025" />
                    </svg>
                </button>
            </div >
        );
    }

    /**
     * Get JSX for type-icon.
     *
     * @param {NotificationType} type
     * @returns {JSX.Element}
     */
    renderIcon(type: NotificationType): JSX.Element {
        if (type === NotificationType.Error) {
            return (
                <div class="icon icon-type--error">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15V13H11V15H9ZM9 5V11H11V5H9Z" fill="#FCFCFC" />
                    </svg>
                </div>
            );
        } else if (type === NotificationType.Success) {
            return (
                <div class="icon icon-type--success">
                    <svg width="18" height="14" viewBox="0 0 18 14" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                        <path d="M5.99997 11.17L1.82997 7L0.409973 8.41L5.99997 14L18 2L16.59 0.59L5.99997 11.17Z" fill="#FCFCFC" />
                    </svg>
                </div>
            );
        } else if (type === NotificationType.Warning) {
            return (
                <div class="icon icon-type--warning">
                    <svg width="22" height="19" viewBox="0 0 22 19" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M22 19L11 0L0 19H22ZM10 16V14H12V16H10ZM10 12H12V8H10V12Z" fill="#FCFCFC" />
                    </svg>
                </div>
            );
        }
        return (
            <div class="icon icon-type--info">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM9 15V9H11V15H9ZM9 5V7H11V5H9Z" fill="#FCFCFC" />
                </svg>
            </div>
        );
    }
}

