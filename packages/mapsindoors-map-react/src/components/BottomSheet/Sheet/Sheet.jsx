import { useContext, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import { useSwipeable } from 'react-swipeable';
import './Sheet.scss';

const sizes = {
    MIN: 1, // Sheet height is the minimum height
    FIT: 2, // Sheet height fits to the content
    MAX: 3  // Sheet height is of maximum height (height of container element)
};

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} props.minheight - The minimum height of the sheet. It cannot be resized to below this height.
 */
function Sheet({ children, isOpen, minHeight }) {

    const sheetRef = useRef();
    const contentRef = useRef();
    const [size, setSize] = useState(sizes.FIT);

    const container = useContext(ContainerContext);

    const [style, setStyle] = useState({});
    const [contentHeight, setContentHeight] = useState();

    /**
     * Change the height of the sheet to one of the preset sizes (min, fit, max).
     *
     * @param {number} targetSize - Which of the sizes to change to.
     */
    function changeSheetHeight(targetSize) {
        if (size === sizes.FIT) {
            sheetRef.current.style.height = `${contentHeight}px`;
        }

        // RequestAnimationFrame needed in order to the above height to kick in thus enabling the transition of height.
        // Inspired by https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
        requestAnimationFrame(() => {
            switch (targetSize) {
                case sizes.MAX:
                    setStyle({ height: `${container.current.clientHeight}px`});
                    break;
                case sizes.FIT:
                    setStyle({ height: `${contentHeight}px`});
                    break;
                case sizes.MIN:
                    setStyle({ height: `${minHeight}px` });
                    break;
                default:
                    break;
            }
            setSize(targetSize);
        });
    }

    /**
     * Handler for swipe gestures.
     */
    const swipeHandler = useSwipeable({
        onSwipedUp: () => changeSheetHeight(Math.min(size+1, Object.keys(sizes).length)),
        onSwipedDown: () => changeSheetHeight(Math.max(0, size-1)),
        trackMouse: true
    });

    /*
     * Handle sheet height when children or isOpen change.
     */
    useEffect(() => {

        if (isOpen === false) {
            setContentHeight();
            sheetRef.current.style.height = '';
        } else {
            setContentHeight(contentRef.current.clientHeight);
        }
    }, [children, isOpen]);


    return <div ref={sheetRef} style={style} className={`sheet ${isOpen ? 'sheet--active' : ''}`}>
        <div {...swipeHandler} className="sheet__swipeable" style={{ touchAction: 'none' }}>
            <div className="sheet__swipeable-icon"></div>
        </div>
        <div ref={contentRef} className="sheet__content">
            {children}
        </div>
    </div>
}

export default Sheet;