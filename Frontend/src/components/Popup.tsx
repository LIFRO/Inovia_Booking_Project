import { useEffect, useRef, type ReactNode } from "react";
import "./CSS/Popup.css";

interface PopupProps{
    children: ReactNode,
    isOpen: boolean,
    onClose: () => void
}

export default function Popup({children, isOpen, onClose}: PopupProps) {
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
            onCancel={handleCancel}
        >
            <div className="popup__content">
                <div className="popup__children">
                    {children}
                </div>
                <button className="popup__close" type="button" onClick={onClose}>
                    close
                </button>
            </div>
        </dialog>
    )
}