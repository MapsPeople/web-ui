import { useRecoilValue } from 'recoil';
import notificationMessageState from '../../../atoms/notificationMessageState';
import { useEffect, useRef } from 'react';
import './Notification.scss';

/**
 * Can show a notification when needed.
 * Use the notificationMessage atom to show or remove a message.
 */
function Notification() {

    const notificationMessage = useRecoilValue(notificationMessageState);
    const elementRef = useRef()

    useEffect(() => {
        elementRef.current?.classList.add('notification'); // Due to difficulties adding class names onto the Web Component, we do it like this.
        if (notificationMessage) {
            elementRef.current.push(notificationMessage.text, notificationMessage.type, true);
        } else {
            elementRef.current.clearAll();
        }
    }, [notificationMessage]);

    return <mi-notification ref={elementRef} position="top-center"></mi-notification>;
}

export default Notification;
