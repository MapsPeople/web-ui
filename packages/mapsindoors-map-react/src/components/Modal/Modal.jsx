import React from "react";
import './Modal.scss'

function Modal({ children }) {
    return (
        <div className="modal">
            This is the modal component
            {children}
        </div>
    )
}

export default Modal;