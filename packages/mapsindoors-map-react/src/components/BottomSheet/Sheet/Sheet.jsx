import { useEffect } from 'react';
import { useRef, useState } from 'react';
import './Sheet.scss';

function Sheet({ children, isOpen, minHeight = 0 }) {

    const draggerRef = useRef();

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
    function startDragging(event) {
        setIsDragging(true);

        // While dragging, prevent default touch move since it will otherwise take over the interaction.
        const preventTouchMoveHandler = event => {
            event.preventDefault();
        }

        const mouseMoveHandler = event => {
            const rect = draggerRef.current.parentNode.getBoundingClientRect();
            const bottomOffset = window.innerHeight - rect.bottom;
            const newHeight = window.innerHeight - event.clientY - bottomOffset;

            // FIXME: also restrict to a max height
            setStyle({ height: `${Math.max(minHeight, newHeight)}px`});
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
        <div onPointerDown={(e) => startDragging(e)} ref={draggerRef} className="sheet__drag">
            <div className="sheet__drag-icon"></div>
        </div>
        {children}
    </div>
}

export default Sheet;