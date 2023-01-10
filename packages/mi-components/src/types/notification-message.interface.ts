import { NotificationType } from '../enums/notification-type.enum';

export interface NotificationMessage {
    id: number,
    message: string,
    sticky: boolean,
    type: NotificationType,
    timer?: number
}