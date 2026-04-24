export default function Modal({ children, onClose }) {
    return (
        <div className="modal">
            <div className="modal-content">
                <button onClick={onClose}>X</button>
                {children}
            </div>
        </div>
    );
}