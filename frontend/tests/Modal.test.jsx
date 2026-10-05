import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@/components/ui/Modal';

function Harness({ onClose = () => {} }) {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button onClick={() => setOpen(true)}>Open</button>
            <Modal isOpen={open} onClose={() => { onClose(); setOpen(false); }} title="Edit list">
                <input aria-label="Name" />
                <button>Save</button>
            </Modal>
        </>
    );
}

describe('Modal', () => {
    it('renders nothing while closed', () => {
        render(<Modal isOpen={false} onClose={() => {}} title="Hidden">content</Modal>);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('is a labelled modal dialog', () => {
        render(<Modal isOpen onClose={() => {}} title="Edit list">content</Modal>);
        const dialog = screen.getByRole('dialog', { name: 'Edit list' });
        expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('moves focus inside when it opens', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByText('Open'));
        expect(screen.getByRole('dialog')).toContainElement(document.activeElement);
    });

    it('prefers an element marked data-autofocus', () => {
        render(
            <Modal isOpen onClose={() => {}} title="Confirm">
                <button>First</button>
                <button data-autofocus>Preferred</button>
            </Modal>,
        );
        expect(screen.getByText('Preferred')).toHaveFocus();
    });

    it('closes on Escape', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        render(<Harness onClose={onClose} />);
        await user.click(screen.getByText('Open'));
        await user.keyboard('{Escape}');
        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes when the close button or backdrop is clicked', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const { container } = render(<Modal isOpen onClose={onClose} title="Edit">content</Modal>);
        await user.click(screen.getByRole('button', { name: 'Close' }));
        await user.click(container.querySelector('[aria-hidden="true"].absolute'));
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('keeps Tab and Shift+Tab inside the dialog', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByText('Open'));
        const close = screen.getByRole('button', { name: 'Close' });
        const save = screen.getByRole('button', { name: 'Save' });

        save.focus();
        await user.tab();
        expect(close).toHaveFocus(); // wrapped from the last control to the first

        await user.tab({ shift: true });
        expect(save).toHaveFocus(); // and back the other way
    });

    it('returns focus to the control that opened it', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        const opener = screen.getByText('Open');
        await user.click(opener);
        await user.keyboard('{Escape}');
        expect(opener).toHaveFocus();
    });

    it('stops the page behind from scrolling, then restores it', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        await user.click(screen.getByText('Open'));
        expect(document.body.style.overflow).toBe('hidden');
        await user.keyboard('{Escape}');
        expect(document.body.style.overflow).toBe('');
    });
});
