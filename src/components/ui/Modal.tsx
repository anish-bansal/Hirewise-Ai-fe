import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./Button"

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    showCloseButton?: boolean;
}

export const Modal = ({ isOpen, onClose, title, children, footer, showCloseButton = true }: ModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-lg bg-background p-6 shadow-lg animate-in zoom-in-95 duration-200">
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between mb-4">
                        {title && <h2 className="text-lg font-semibold">{title}</h2>}
                        {showCloseButton && (
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}
                <div className={title || showCloseButton ? "mb-6" : ""}>{children}</div>
                {footer && <div className="flex justify-end space-x-2">{footer}</div>}
            </div>
        </div>
    );
};
