'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

export default function EditListModal({ isOpen, onClose, list, onUpdate }) {
    const toast = useToast();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (list) {
            setName(list.name);
            setDescription(list.description || '');
        }
    }, [list]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/lists/${list._id}`, { name, description });
            onUpdate(res.data);
            toast.success('List updated');
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit list">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="edit-list-name" className="label block mb-1">Name</label>
                    <input
                        id="edit-list-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        className="field"
                        required
                        data-autofocus
                    />
                </div>
                <div>
                    <label htmlFor="edit-list-description" className="label block mb-1">Description</label>
                    <textarea
                        id="edit-list-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        maxLength={500}
                        rows={4}
                        className="field resize-none"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                        Save changes
                    </button>
                </div>
            </form>
        </Modal>
    );
}
