import { useContext, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import { useSwipeable } from 'react-swipeable';
import { snapPoints } from '../../../constants/snapPoints';
import './Sheet.scss';
import PropTypes from 'prop-types';

Sheet.propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    initialSnapPoint: PropTypes.string.isRequired,
    minimizedHeight: PropTypes.number.isRequired
};

/**
 * A Sheet for showing content in the bottom of the screen inside the BottomSheet.
 *
 * The user can swipe the sheet up and down to change its height.
 * The sheet can be set to one of three snap points: MAX, FIT, MIN.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the sheet.
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} props.initialSnapPoint - The initial snap point of the sheet.
 * @param {number} props.minimizedHeight - The minimum height of the sheet. It cannot be resized below this height.
 */
function Sheet({ children, isOpen, initialSnapPoint, minimizedHeight }) {
    /** Referencing the sheet DOM element */
    const sheetRef = useRef();

    /** Referencing the DOM element of the sheet content div, the one containing the children. */
    const contentRef = useRef();

    /** Tracking last known content height. Used when determining snap points then the user is making a swipe gesture. */
    const contentHeightRef = useRef();

    /** Used to determine if a swipe gesture should count as a swipe up or down */
    const dragStartHeight = useRef();

    /** Holding the snap point that the sheet height is currently snapped to */
    const snappedTo = useRef();

    /** CSS styles for both div elements, containing a height */
    // TODO: Should this just be a height state?
    const [style, setStyle] = useState({});

    /** True if the sheet is currently being dragged with pointer (mouse, finger) */
    const [isDragging, setIsDragging] = useState(false); // eslint-disable-line

    /**
     * Reference to the DOM element of the container element of all bottom sheets.
     * This is used for eg. a full height bottom sheet.
     */
    const container = useContext(ContainerContext);

    /**
     * Change sheet height to one of the three snap points.
     *
     * @param {number} snapPoint
     */
    function snapSheetHeightToSnapPoint(snapPoint) {

        // Set the actual pixel height of the sheet.
        // RequestAnimationFrame is needed in order to the height style change to kick in thus enabling the transition of height.
        // Inspired by https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
        requestAnimationFrame(() => {
            switch (snapPoint) {
                case snapPoints.MAX:
                    setStyle({ height: `${container.current.clientHeight}px` });
                    contentHeightRef.current = container.current.clientHeight;
                    break;
                case snapPoints.FIT: {
                    // Get the height of the contentRef div
                    const height = contentRef.current.children.item(0).clientHeight;

                    // if that height is less than the minimized height, set the height to the minimized height
                    if (height < minimizedHeight) {
                        setStyle({ height: `${minimizedHeight}px` });
                        contentHeightRef.current = minimizedHeight;
                        snapPoint = snapPoints.MIN;
                    } else {
                        setStyle({ height: `${height}px` });
                        contentHeightRef.current = height;
                    }

                    break;
                }
                case snapPoints.MIN:
                    setStyle({ height: `${minimizedHeight}px` });
                    contentHeightRef.current = minimizedHeight;
                    break;
                default:
                    break;
            }
        });

        snappedTo.current = snapPoint;
    }

    /**
     * Handler for swipe gestures on the sheet.
     *
     * The handler is created using the useSwipeable hook from the react-swipeable library.
     * It allows the user to swipe up and down to change the height of the sheet.
     */
    const swipeHandler = useSwipeable({
        onSwipeStart: () => {
            setIsDragging(true);
            dragStartHeight.current = sheetRef.current.clientHeight;
        },
        onSwiping: swipeEvent => {
            const height = Math.max(dragStartHeight.current - swipeEvent.deltaY, minimizedHeight);
            setStyle({ height: `${height}px` });
        },
        onSwiped: swipeEvent => {
            setIsDragging(false);
            if (Math.abs(swipeEvent.deltaY) < 60) {
                // If the user swiped less than 60 pixels, it doesn't count as a change, and the sheet
                // should snap back to the current snap point.
                snapSheetHeightToSnapPoint(snappedTo.current);
            } else {
                // Determine new snapped point based on the swipe direction and the current snap point.
                let newSnapPoint;
                if (swipeEvent.dir.toUpperCase() === 'DOWN') {
                    if (snappedTo.current === snapPoints.MAX) {
                        newSnapPoint = snapPoints.FIT;
                    } else if (snappedTo.current === snapPoints.FIT) {
                        newSnapPoint = snapPoints.MIN;
                    }
                } else if (swipeEvent.dir.toUpperCase() === 'UP') {
                    if (snappedTo.current === snapPoints.MIN) {
                        newSnapPoint = snapPoints.FIT;
                    } else if (snappedTo.current === snapPoints.FIT) {
                        newSnapPoint = snapPoints.MAX;
                    }
                }

                if (newSnapPoint) {
                    snapSheetHeightToSnapPoint(newSnapPoint);
                }
            }
        },
        trackMouse: true,
        preventScrollOnSwipe: true
    });

    useEffect(() => {
        if (isOpen) {
            snappedTo.current = initialSnapPoint;
            snapSheetHeightToSnapPoint(initialSnapPoint);
        } else {
            // TODO Anything?
        }

    }, [minimizedHeight, initialSnapPoint, isOpen]);


    /**
     * Pass through ref to share the ref between the component and the useSwipeable hook.
     */
    const refPassthrough = el => {
        swipeHandler.ref(el);
        sheetRef.current = el;
    }

    return (
        <div
            {...swipeHandler}
            ref={refPassthrough}
            className={`sheet ${isOpen ? 'sheet--active' : ''} ${isDragging ? 'sheet--dragging' : ''}`}
            style={style}
        >
            {/* We need to have a div in a div for it being able to scroll content separately and for the height to be measurable */}
            <div ref={contentRef} className="sheet__content" style={style}>
                {children}
            </div>
        </div>
    );
}

export default Sheet;