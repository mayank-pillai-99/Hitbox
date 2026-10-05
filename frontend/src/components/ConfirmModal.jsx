'use client';

import Modal from '@/components/ui/Modal';

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // 'danger' or 'warning'
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="text-muted mb-6">{message}</p>
            <div className="flex gap-3">
                <button onClick={onClose} data-autofocus className="btn-ghost flex-1">
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`flex-1 btn-primary ${variant === 'danger' ? '!bg-hot !text-white hover:!bg-fg hover:!text-black' : '!bg-warn'}`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
}
