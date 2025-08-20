import React, { cloneElement, forwardRef, useContext, useEffect, useImperativeHandle } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import { useSwipeable } from 'react-swipeable';
import { snapPoints } from '../../../constants/snapPoints';
import './Sheet.scss';
import PropTypes from 'prop-types';

/**
 * A Sheet for showing content in the bottom of the screen inside the BottomSheet.
 *
 * The user can swipe the sheet up and down to change its height.
 * The sheet height can be set to one of three snap points. These can be set programatically or by the user making a swipe up/down gesture.
 * We use the react-swipeable library to handle swipe gestures.
 *
 * To set sheet height programatically, use the setSnapPoint method. This method can be called from outside the component.
 *
 * The snap points are (see the constants/snapPoints.js file): MIN, FIT, MAX where MIN is a value specified by us in pixels (the minimizedHeight prop),
 * fit is fitting the content of the sheet and MAX is the maximum allowed height of the sheet (the height of the container element).
 *
 * The swipe up/down gesture can be set to not react on scrollable content, using the usePreventSwipe hook. This way, the user can scroll the content of the sheet without
 * the sheet reacting to the swipe gesture. This is useful for eg. a list of search results.
 *
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the sheet.
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} props.initialSnapPoint - The initial snap point of the sheet.
 * @param {number} props.minimizedHeight - The minimum height of the sheet. It cannot be resized below this height.
 */
const Sheet = forwardRef(function SheetComponent({ children, isOpen, initialSnapPoint, minimizedHeight }, ref) {
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
    const [style, setStyle] = useState({});

    /** True if the sheet is currently being dragged with pointer (mouse, finger) */
    const [isDragging, setIsDragging] = useState(false);

    /** Hold the snap point that the user has swiped to (and thus never initial or programatically set snap point) */
    const [swipedSnapPoint, setSwipedSnapPoint] = useState(null);

    /**
     * Reference to the DOM element of the container element of all bottom sheets.
     * This is used for eg. a full height bottom sheet.
     */
    const container = useContext(ContainerContext);

    /**
     * Mutation observer to watch for changes in the content height of the sheet.
     * This is used when the sheet is set to FIT snap point.
     * When the content height changes, the height of the sheet is updated accordingly.
     * This is needed because the content of the sheet can change dynamically (eg. when the user types in a search field).
     */
    const fitMutationObserver = useRef();

    /*
     * Methods to be called from outside the component.
     */
    useImperativeHandle(ref, () => ({
        /**
         * Set the height of the sheet to the given snap point.
         *
         * @param {string} snapPoint - The snap point to set the height to.
         */
        setSnapPoint(snapPoint) {
            snapSheetHeightToSnapPoint(snapPoint);
        }
    }));

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

    /*
     * When the sheet is active, and the current snap point is set to FIT or MAX, we need to observe the content height of the sheet in
     * order to react on dynamic changes in the content height.
     */
    useEffect(() => {
        if (isOpen && snappedTo.current === snapPoints.FIT) {
            observeContentHeight();
        } else {
            stopObserveContentHeight();
        }

        return () => {
            stopObserveContentHeight();
        }
    }, [isOpen, snappedTo.current]);

    /**
     * Observe the content height of the sheet and update the height of the sheet accordingly.
     * This is only done when the sheet's snap point is set to FIT.
     */
    function observeContentHeight() {
        if (fitMutationObserver.current) {
            fitMutationObserver.current.disconnect();
        }

        fitMutationObserver.current = new MutationObserver(() => {
            snapSheetHeightToSnapPoint(snapPoints.FIT);
        });

        fitMutationObserver.current.observe(contentRef.current, {
            childList: true, // checks if children are added or removed
            subtree: true // check if descendants are added or removed all the way down the tree of DOM nodes
        });
    }

    /**
     * Disconnect the mutation observer that is observing the content height of the sheet.
     */
    function stopObserveContentHeight() {
        if (fitMutationObserver.current) {
            fitMutationObserver.current.disconnect();
        }
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
            setSwipedSnapPoint(null);
            dragStartHeight.current = sheetRef.current.clientHeight;
        },
        onSwiping: swipeEvent => {
            const height = Math.max(dragStartHeight.current - swipeEvent.deltaY, minimizedHeight);
            setStyle({ height: `${height}px` });
        },
        onSwiped: swipeEvent => {
            setIsDragging(false);
            const snapPoint = calculateSnapPoint(
                swipeEvent.dir,
                swipeEvent.deltaY,
                snappedTo.current,
                minimizedHeight,
                container.current.clientHeight, // max available height: the height of the bottom sheet container
                contentRef.current.children.item(0) // the dom element of the sheet content (child)
            );

            if (snapPoint) {
                snapSheetHeightToSnapPoint(snapPoint);
                setSwipedSnapPoint(snapPoint);
            }
        },
        trackMouse: true, // Allow mouse swipes. Usually only used while development, but no harm in keeping it.
        preventScrollOnSwipe: true // Prevent scrolling of the page when swiping (using preventDefault). See https://nearform.com/open-source/react-swipeable/docs/api/#preventscrollonswipe-details
    });

    useEffect(() => {
        if (isOpen) {
            snappedTo.current = initialSnapPoint;
            snapSheetHeightToSnapPoint(initialSnapPoint);
        }
    }, [minimizedHeight, initialSnapPoint, isOpen]);


    /**
     * Pass through ref to share the ref between the component and the useSwipeable hook.
     */
    const refPassthrough = el => {
        swipeHandler.ref(el);
        sheetRef.current = el;
    }

    /**
     * Clone the children.
     *
     * We do that because we want to pass the snapPointSwipedByUser prop to the children.
     * Since it is not possible to pass props to children in React (they are immutable), we need to clone the children and then add the prop.
     * See https://frontarm.com/james-k-nelson/passing-data-props-children/
     */
    const clonedChildren = React.Children.map(children, child =>
        cloneElement(child, { snapPointSwipedByUser: swipedSnapPoint })
    );

    return (
        <div
            {...swipeHandler}
            ref={refPassthrough}
            className={`sheet ${isOpen ? 'sheet--active' : ''} ${isDragging ? 'sheet--dragging' : ''} ${snappedTo.current === snapPoints.MAX ? 'sheet--max' : ''}`}
            style={style}
        >
            {/* We need to have a div in a div for it being able to scroll content separately and for the height to be measurable */}
            <div ref={contentRef} className={`sheet__content ${snappedTo.current === snapPoints.MIN ? 'sheet__content--no-scroll' : ''}`} style={style}>
                {clonedChildren}
            </div>
        </div>
    );
});

Sheet.propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    initialSnapPoint: PropTypes.string.isRequired,
    minimizedHeight: PropTypes.number.isRequired
};

export default Sheet;

/**
 * Calculate the snap point of the sheet based on the swipe direction.
 *
 * @param {string} swipeDirection - 'UP' or 'DOWN'
 * @param {number} swipeLength - The length of the swipe in pixels
 * @param {string} currentSnapPoint - The current snap point of the sheet
 * @param {number} minHeight - The minimum height of the sheet in pixels
 * @param {number} maxHeight - The maximum height of that the sheet can take up in pixels
 * @param {HTMLElement} element - The DOM element of the sheet content
 */
export function calculateSnapPoint(swipeDirection, swipeLength, currentSnapPoint, minHeight, maxHeight, element) {
    const minSwipeLength = 60; // Minimum swipe length to consider a change

    // If the user swiped less than the minimum length, we don't consider it a deliberate swipe
    if (Math.abs(swipeLength) < minSwipeLength) {
        return currentSnapPoint;
    }

    let newSnapPoint;

    if (swipeDirection.toUpperCase() === 'DOWN') {
        if (currentSnapPoint === snapPoints.MAX) {
            if (hasScrollableContent(element)) {
                // If the content has scrollable content, it means that the fit height would be larger than that. So we go to MIN.
                newSnapPoint = snapPoints.MIN;
            } else if (element.clientHeight <= maxHeight && element.clientHeight > minHeight) {
                // If the content height is less than or equal to the maximum height and larger than min height, we go directly to FIT, otherwise we go to MIN
                newSnapPoint = snapPoints.FIT;
            } else {
                newSnapPoint = snapPoints.MIN;
            }
        } else if (currentSnapPoint === snapPoints.FIT) {
            newSnapPoint = snapPoints.MIN;
        }
    } else if (swipeDirection.toUpperCase() === 'UP') {
        if (currentSnapPoint === snapPoints.MIN) {
            // If the content height is less than or equal to the min height or larger than max height, we go directly to MAX, otherwise we go to FIT
            if (element.clientHeight <= minHeight || element.clientHeight > maxHeight) {
                newSnapPoint = snapPoints.MAX;
            } else {
                newSnapPoint = snapPoints.FIT;
            }

        } else if (currentSnapPoint === snapPoints.FIT) {
            newSnapPoint = snapPoints.MAX;
        }
    }

    return newSnapPoint;
}

/**
 * Check if a DOM element or any of its direct children has scrollable content.
 *
 * @param {HTMLElement} element - The DOM element to check.
 * @returns {boolean} - True if the element or any of its direct children has scrollable content, false otherwise.
 */
function hasScrollableContent(element) {
    if (!element) {
        return false;
    }

    // Check if the element itself has scrollable content
    if (element.scrollHeight > element.clientHeight) {
        return true;
    }

    // Check if any direct child has scrollable content
    for (const child of element.children) {
        if (child.scrollHeight > child.clientHeight) {
            return true;
        }
    }

    return false;
}
