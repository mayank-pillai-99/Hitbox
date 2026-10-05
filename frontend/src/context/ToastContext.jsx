'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

const STYLES = {
    success: { color: 'var(--color-neon)', Icon: CheckCircle },
    error: { color: 'var(--color-hot)', Icon: XCircle },
    warning: { color: 'var(--color-warn)', Icon: AlertCircle },
};

let nextId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message, type = 'success', duration = 3500) => {
        const id = ++nextId;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const success = useCallback((message) => addToast(message, 'success'), [addToast]);
    // Errors stay up longer so there is time to read them.
    const error = useCallback((message) => addToast(message, 'error', 6000), [addToast]);
    const warning = useCallback((message) => addToast(message, 'warning', 5000), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning }}>
            {children}

            <div
                role="status"
                aria-live="polite"
                className="fixed bottom-4 right-4 left-4 sm:left-auto z-[120] flex flex-col gap-2 sm:w-96"
            >
                {toasts.map(({ id, message, type }) => {
                    const { color, Icon } = STYLES[type];
                    return (
                        <div
                            key={id}
                            className="panel flex items-start gap-3 px-4 py-3 animate-slide-in"
                            style={{ borderLeft: `4px solid ${color}` }}
                        >
                            <Icon className="w-5 h-5 mt-0.5 shrink-0" style={{ color }} aria-hidden="true" />
                            <span className="flex-1 text-sm text-fg">{message}</span>
                            <button
                                onClick={() => removeToast(id)}
                                aria-label="Dismiss notification"
                                className="-m-2 w-11 h-11 flex items-center justify-center text-muted hover:text-fg"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
