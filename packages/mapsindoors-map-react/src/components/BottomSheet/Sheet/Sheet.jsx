import './Sheet.scss';

function Sheet({ children, isOpen }) {

    return <div className={`sheet ${isOpen ? 'sheet--active' : ''}`}>
        <div className="sheet__drag">
            {/* FIXME: Make sheet draggable when dragging this div */}
            <div className="sheet__drag-icon"></div>
        </div>
        {children}
    </div>
}

export default Sheet;