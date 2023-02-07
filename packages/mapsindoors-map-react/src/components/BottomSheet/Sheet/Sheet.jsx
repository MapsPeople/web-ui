import { useContext, useEffect } from 'react';
import { useRef, useState } from 'react';
import { ContainerContext } from '../ContainerContext';
import './Sheet.scss';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen - If the sheet is open (visible) or not.
 * @param {number} [props.minheight=0] - The minimum height of the sheet. It cannot be resized to below this height.
 * @param {number[]} [props.snapPoints=[]] - Snap points that help the user resize to preset heights. Values are percentages of container height.
 * @param {boolean} [props.addSnapPointForContent=true] - Will add a snap point that fits with the content height.
 */
function Sheet({ children, isOpen, minHeight = 0, snapPoints = [], addSnapPointForContent = false }) {

    const draggerRef = useRef();
    const contentRef = useRef();

    const container = useContext(ContainerContext);

    const [style, setStyle] = useState({});
    const [isDragging, setIsDragging] = useState(false);

    /*
     * Reset hardcoded height when children or isOpen change.
     */
    useEffect(() => {
        setStyle({});
    }, [children, isOpen]);

    /*
     * Dragging functionality: Make it possible to drag the sheet to another size.
     */
    function startDragging() {
        setIsDragging(true);

        // While dragging, prevent default touch move since it will otherwise take over the interaction.
        const preventTouchMoveHandler = event => {
            event.preventDefault();
        }

        const mouseMoveHandler = event => {
            const rect = draggerRef.current.parentNode.getBoundingClientRect();
            const bottomOffset = window.innerHeight - rect.bottom;
            let draggedHeight = window.innerHeight - event.clientY - bottomOffset;

            const allSnapPoints = snapPoints;
            if (addSnapPointForContent === true) {
                // Add snapshot for content height as a percentage value
                allSnapPoints.push(contentRef.current.clientHeight / container.current.clientHeight * 100);
            }

            // Snap to snap points if close enough
            for (const snapPointPercentage of allSnapPoints) {
                const snapPoint = Math.max(container.current.clientHeight * snapPointPercentage / 100, minHeight);

                const upperBound = Math.min(snapPoint + 40, container.current.clientHeight);
                const lowerBound = Math.max(snapPoint - 40, 0);

                if (draggedHeight >= lowerBound && draggedHeight <= upperBound) {
                    draggedHeight = snapPoint;
                }
            }

            const maxHeight = container.current.clientHeight;

            const sheetHeight = Math.min(Math.max(minHeight, draggedHeight), maxHeight);
            setStyle({ height: `${sheetHeight}px`});
        };

        document.addEventListener('touchmove', preventTouchMoveHandler, { passive: false });
        document.addEventListener('pointermove', mouseMoveHandler);

        window.addEventListener('pointerup', function mouseUpHandler() {
            document.removeEventListener('pointermove', mouseMoveHandler);
            window.removeEventListener('pointerup', mouseUpHandler);
            document.removeEventListener('touchmove', preventTouchMoveHandler);
            setIsDragging(false);
        });
    }

    return <div style={style} className={`sheet ${isOpen ? 'sheet--active' : ''} ${isDragging ? 'sheet--dragging' : ''}`}>
        <div onPointerDown={startDragging} ref={draggerRef} className="sheet__drag">
            <div className="sheet__drag-icon"></div>
        </div>
        <div ref={contentRef}>
            {children}
        </div>
    </div>
}

export default Sheet;