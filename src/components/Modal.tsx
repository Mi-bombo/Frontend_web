import type { ReactNode } from "react";
import { useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    title?: string;
    children: ReactNode;
    footer?: ReactNode;
    onClose: () => void;
    size?: "sm" | "md" | "lg";
};

export default function Modal({
    isOpen,
    title,
    children,
    footer,
    onClose,
    size = "md",
    }: ModalProps) {
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [onClose]);

    if (!isOpen) return null;

    const sizes: Record<string, string> = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
    };

    return (
        <div
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
        <div
            className="absolute inset-0 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
        />
        <div
            className={`relative w-full ${sizes[size]} rounded-2xl bg-white shadow-xl`}
        >
            <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
                onClick={onClose}
                className="p-2 rounded-full cursor-pointer text-slate-500 hover:bg-slate-100"
                aria-label="Cerrar"
            >
                ✕
            </button>
            </div>
            <div className="p-4">{children}</div>
            {footer && <div className="p-3 border-t">{footer}</div>}
        </div>
        </div>
    );
}