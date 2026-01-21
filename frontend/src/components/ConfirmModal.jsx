'use client';

import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger' // 'danger' or 'warning'
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="animate-scale-in relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-red-500/20' : 'bg-yellow-500/20'
                    }`}>
                    <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-400' : 'text-yellow-400'
                        }`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>

                {/* Message */}
                <p className="text-zinc-400 text-sm mb-6">{message}</p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${variant === 'danger'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
