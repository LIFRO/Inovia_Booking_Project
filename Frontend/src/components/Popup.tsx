import { useEffect, useRef, type ReactNode } from "react";
import "./CSS/Popup.css";

interface PopupProps{
    children: ReactNode,
    isOpen: boolean,
    onClose: () => void,
    label: string
}

export default function Popup({children, isOpen, onClose, label}: PopupProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if(!dialog) return;

        if(isOpen){
            dialog.showModal();
        }
        else{
            dialog.close();
        }
    }, [isOpen])

    const handleCancel = (e: React.SyntheticEvent) => {
        e.preventDefault();
        onClose();
    }

    return(
        <dialog
            ref={dialogRef}
            className="popup"
            aria-label={label}
            onCancel={handleCancel}
            onClick={event => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="popup__content">
                <button className="popup__close" type="button" onClick={onClose} aria-label="Close dialog">
                    ×
                </button>
                <div className="popup__children">
                    {children}
                </div>
            </div>
        </dialog>
    )
}
