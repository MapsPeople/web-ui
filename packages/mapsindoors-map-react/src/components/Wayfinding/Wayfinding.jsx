import './Wayfinding.scss';
import { ReactComponent as CloseIcon } from '../../assets/close.svg';
import { useSwipeable } from 'react-swipeable';

function Wayfinding({ onClose, onBack }) {

    // FIXME: Implement properly. This is just a placeholder and a demo

    // Prevent swipe gestures to take over when scrolling in a scrollable element.
    const scrollableContentSwipePrevent = useSwipeable({
        onSwiping: ({ event }) => event.stopPropagation()
    })

    return <div className="wayfinding">
        <div className="wayfinding__header">
            <button onClick={() => onBack()}>
                ‹
            </button>
            <button onClick={() => onClose()}>
                <CloseIcon />
            </button>
        </div>

        <p>Placeholder for wayfinding</p>
        <p>
            <input placeholder="Current position" />
        </p>

        <p>
            Example scrollable element
        </p>
        <div {...scrollableContentSwipePrevent} className="wayfinding__scrollable-demo" data-prevent-swipe>
            {Array(30).fill().map((e, i) => {
                return <div key={i}>Number {i+1}<br /><small>Demo list item</small></div>
            })}
        </div>
    </div>
}

export default Wayfinding;
