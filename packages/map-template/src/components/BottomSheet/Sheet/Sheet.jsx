import { useContext, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import { useSwipeable } from 'react-swipeable';
import { snapPoints } from '../../../constants/snapPoints';
import './Sheet.scss';
import { useRecoilState } from 'recoil';
import isBottomSheetLoadedState from '../../../atoms/isBottomSheetLoadedState';
import PropTypes from 'prop-types';


let dragStartHeight;

Sheet.propTypes = {
    children: PropTypes.node.isRequired,
    isOpen: PropTypes.bool.isRequired,
    minHeight: PropTypes.string.isRequired,
    preferredSizeSnapPoint: PropTypes.number,
    onSwipedToSnapPoint: PropTypes.func,
    reFitWhenContentChanges: PropTypes.bool
};

/**
 * A Sheet for showing content in the bottom of the screen.
 * The sheet height can be changed with swipe gestures.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the sheet
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} props.minheight - The minimum height of the sheet. It cannot be resized to below this height.
 * @param {number} props.preferredSizeSnapPoint - Change this to programatically change sheet height to a snap point.
 * @param {function} [props.onSwipedToSnapPoint] - Callback function is run when user swiped to a snap points. Has the snap point as parameter.
 */
function Sheet({ children, isOpen, minHeight, preferredSizeSnapPoint, onSwipedToSnapPoint, reFitWhenContentChanges }) {

    /** Referencing the sheet DOM element */
    const sheetRef = useRef();

    /** Referencing the DOM element of the sheet content div. */
    const contentRef = useRef();

    /** The current size preset ("snap point") */
    const [currentSnapPoint, setCurrentSnapPoint] = useState(snapPoints.FIT);

    /** True if the sheet is currently being dragged with pointer (mouse, finger) */
    const [isDragging, setIsDragging] = useState(false);

    /** If user is swiping up or down */
    const [swipeGestureDirection, setSwipeGestureDirection] = useState();

    /** Reference to the DOM element of the container element of all bottom sheets. */
    const container = useContext(ContainerContext);

    /** The current height of the content in pixels */
    const contentHeightRef = useRef();

    const [style, setStyle] = useState({});

    const [, setIsBottomSheetLoaded] = useRecoilState(isBottomSheetLoadedState);

    let fitMutationObserver;

    /**
     * Set up a mutation observer to listen to changes in child content.
     * When changes are detected, we will re-fit the sheet to the content.
     */
    function setupFitMutationObserver() {
        if (fitMutationObserver) {
            fitMutationObserver.disconnect();
        }

        fitMutationObserver = new MutationObserver(() => {
            const height = contentRef.current.children.item(0).clientHeight;
            contentHeightRef.current = height;
            changeSheetHeight(snapPoints.FIT);
        });

        fitMutationObserver.observe(contentRef.current, {
            childList: true, // checks if children are added or removed
            subtree: true // check if descendants are added or removed all the way down the tree of DOM nodes
        });
    }

    /**
     * Change the height of the sheet to one of the preset sizes (min, fit, max).
     *
     * @param {number} targetSize - Which of the sizes to change to.
     */
    function changeSheetHeight(targetSize) {
        // Prevent going to minimum size state if the content size is the same in order to prevent the need for double swipes to change height.
        if (targetSize === snapPoints.MIN && contentHeightRef.current <= minHeight) {
            return;
        }

        if (currentSnapPoint === snapPoints.FIT) {
            sheetRef.current.style.height = `${contentHeightRef.current}px`;
        }

        // Set the actual pixel height of the sheet.
        // RequestAnimationFrame is needed in order to the height style change to kick in thus enabling the transition of height.
        // Inspired by https://css-tricks.com/using-css-transitions-auto-dimensions/#aa-technique-3-javascript
        requestAnimationFrame(() => {
            switch (targetSize) {
                case snapPoints.MAX:
                    setStyle({ height: `${container.current.clientHeight}px` });
                    break;
                case snapPoints.FIT:
                    setStyle({ height: `${contentHeightRef.current}px` });
                    break;
                case snapPoints.MIN:
                    setStyle({ height: `${minHeight}px` });
                    break;
                default:
                    break;
            }
            setCurrentSnapPoint(targetSize);
        });

        if (typeof onSwipedToSnapPoint === 'function') {
            // When snap transition has ended, call the callback
            sheetRef.current.addEventListener('transitionend', () => {
                onSwipedToSnapPoint(targetSize);
            }, { once: true });
        }
    }

    /**
     * When the transition has ended, set the "setIsBottomSheetLoaded" atom to true.
     */
    useEffect(() => {
        sheetRef.current.addEventListener('transitionend', () => {
            setIsBottomSheetLoaded(true);
        }, { once: true });
    }, []);

    /**
     * React to changes in the size prop, meaning something requests
     * the sheet to be set to a certain snap point.
     */
    useEffect(() => {
        // If the sheet is instructed to fit to content, set up a mutation observer to listen to changes.
        if (isOpen && reFitWhenContentChanges && preferredSizeSnapPoint === snapPoints.FIT) {
            setupFitMutationObserver();
        } else if (reFitWhenContentChanges) {
            if (fitMutationObserver) {
                fitMutationObserver.disconnect();
            }
        }

        // Do not set the height of the sheet if the preferredSizeSnapPoint is undefined.
        if (preferredSizeSnapPoint === undefined) {
            return;
        }

        sheetRef.current.style.height = `${sheetRef.current.clientHeight}px`;

        requestAnimationFrame(() => {
            changeSheetHeight(preferredSizeSnapPoint);
        });

        return () => {
            if (fitMutationObserver) {
                fitMutationObserver.disconnect();
            }
        };
    }, [preferredSizeSnapPoint, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

    /**
     * Handler for swipe gestures on the sheet.
     */
    const swipeHandler = useSwipeable({
        onSwipeStart: (e) => {
            setIsDragging(true);
            setSwipeGestureDirection(e.dir);
            dragStartHeight = sheetRef.current.clientHeight;
        },
        onSwiping: (e) => {
            // Constantly update the sheet height corresponding to the pointer position.
            const height = Math.max(dragStartHeight - e.deltaY, minHeight);
            setStyle({ height: `${height}px` });
        },
        onSwiped: (e) => {
            // When swiping stopped, snap to a snap point.
            // The snap point is the next one in the swipe direction if the swiped distance was more than 60px.
            // Otherwise it will bounce back to the current snap point.

            setIsDragging(false);
            const newHeight = Math.max(dragStartHeight - e.deltaY, minHeight);

            let minThreshold, maxThreshold;
            if (swipeGestureDirection.toUpperCase() === 'DOWN') {
                minThreshold = contentHeightRef.current - 60;
                maxThreshold = container.current.clientHeight - 60;
            } else {
                minThreshold = parseInt(minHeight) + 60;
                maxThreshold = contentHeightRef.current + 60;
            }

            let targetSnapPoint;
            if (newHeight <= minThreshold) {
                targetSnapPoint = snapPoints.MIN;
            } else if (newHeight <= maxThreshold) {
                targetSnapPoint = snapPoints.FIT;
            } else {
                targetSnapPoint = snapPoints.MAX;
            }

            changeSheetHeight(targetSnapPoint);
        },
        trackMouse: true,
        preventScrollOnSwipe: true
    });

    /*
     * Handle sheet height when children or isOpen change.
     */
    useEffect(() => {
        if (isOpen === false) {
            contentHeightRef.current = undefined;
            sheetRef.current.style.height = '';
        } else {
            contentHeightRef.current = contentRef.current.clientHeight;
        }
    }, [children.length, isOpen]);

    /*
     * Pass through ref to share the ref between component and useSwipeable.
     */
    const refPassthrough = el => {
        swipeHandler.ref(el);
        sheetRef.current = el;
    };

    return <div {...swipeHandler} ref={refPassthrough} style={style} className={`sheet ${isOpen ? 'sheet--active' : ''} ${isDragging ? 'sheet--dragging' : ''}`}>
        <div ref={contentRef} className="sheet__content" style={style}>
            {children}
        </div>
    </div>
}

export default Sheet;