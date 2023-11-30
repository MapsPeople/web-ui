import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import substepsToggledState from '../../../atoms/substepsToggledState';
import './Modal.scss';
import kioskOriginLocationIdState from '../../../atoms/kioskOriginLocationIdState';

/**
 * A Modal for showing content in the Sidebar.
 *
 * The modal listens for changes in children in order to constraint the max height while making the content
 * scrollable.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - If the modal is open (visible) or not.
 */
function Modal({ children, isOpen }) {

    /** Boolean for controlling the "full" CSS class modifier */
    const [fullHeight, setFullHeight] = useState(false);

    const substeps = useRecoilValue(substepsToggledState);

    const kioskOriginLocationId = useRecoilValue(kioskOriginLocationIdState);

    const modalRef = useRef();
    const contentRef = useRef();

    /*
     * Listen for changes in the children in order to set the fullHeight state.
     * If the height of the content is bigger than the height of the modal, the fullHeight should be set.
     */
    useEffect(() => {
        if (!contentRef) return;
        const observer = new MutationObserver(() => {
            const contentHeight = contentRef.current.clientHeight;
            const modalHeight = modalRef.current?.clientHeight;
            setFullHeight(contentHeight > modalHeight);
        });

        observer.observe(contentRef.current, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
        }
    }, [contentRef]);

    return <div ref={modalRef}
        className={`modal ${isOpen ? 'modal--open' : ''} ${fullHeight ? 'modal--full' : ''} ${substeps ? 'modal--substeps' : ''} ${kioskOriginLocationId ? 'modal--kiosk' : ''}`}>
        <div ref={contentRef} className="modal__content">
            {children}
        </div>
    </div>
}

export default Modal;
