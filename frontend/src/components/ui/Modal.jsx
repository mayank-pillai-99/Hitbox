'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])';

// An accessible dialog: labelled, Esc closes, Tab stays inside, focus returns to whatever opened it,
// and the page behind doesn't scroll. Render nothing while closed so effects only run when open.
export default function Modal({ isOpen, ...props }) {
    return isOpen ? <OpenModal {...props} /> : null;
}

function OpenModal({ onClose, title, children, size = 'md' }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    // The key handler below is attached once, so it reads the latest onClose through a ref.
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        const opener = document.activeElement;
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Start on the first control inside, or on the dialog itself.
        (dialog.querySelector('[data-autofocus]') || dialog.querySelector(FOCUSABLE) || dialog).focus();

        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onCloseRef.current();
                return;
            }
            if (e.key !== 'Tab') return;

            const items = [...dialog.querySelectorAll(FOCUSABLE)];
            if (items.length === 0) {
                e.preventDefault();
                return;
            }
            const first = items[0];
            const last = items[items.length - 1];
            if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            if (opener instanceof HTMLElement) opener.focus();
        };
    }, []);

    const width = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }[size] ?? 'max-w-md';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/85" onClick={onClose} aria-hidden="true" />
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className={`relative panel brackets w-full ${width} max-h-[90vh] overflow-y-auto p-6 animate-scale-in`}
            >
                <button onClick={onClose} aria-label="Close" className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-muted hover:text-neon">
                    <X className="w-5 h-5" aria-hidden="true" />
                </button>
                <h2 id={titleId} className="display text-2xl pr-10 mb-4">
                    {title}
                </h2>
                {children}
            </div>
        </div>
    );
}
