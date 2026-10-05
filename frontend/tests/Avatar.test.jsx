import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import Avatar from '@/components/ui/Avatar';

describe('Avatar', () => {
    it('shows the picture, hidden from screen readers unless labelled', () => {
        const { container } = render(<Avatar user={{ username: 'dana', profilePicture: 'https://x/a.png' }} />);
        const img = container.querySelector('img');
        expect(img).toHaveAttribute('src', 'https://x/a.png');
        expect(img).toHaveAttribute('alt', '');
    });

    it('uses the label as alt text when given', () => {
        render(<Avatar user={{ username: 'dana', profilePicture: 'https://x/a.png' }} label="dana" />);
        expect(screen.getByAltText('dana')).toBeInTheDocument();
    });

    it('falls back to the uppercase initial without a picture', () => {
        render(<Avatar user={{ username: 'dana' }} label="dana" />);
        expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('falls back to the initial when the picture fails to load', () => {
        const { container } = render(<Avatar user={{ username: 'eli', profilePicture: 'https://x/broken.png' }} />);
        fireEvent.error(container.querySelector('img'));
        expect(container.querySelector('img')).toBeNull();
        expect(screen.getByText('E')).toBeInTheDocument();
    });

    it('copes with no user at all', () => {
        render(<Avatar user={null} />);
        expect(screen.getByText('?')).toBeInTheDocument();
    });

    it('applies the requested size', () => {
        const { container } = render(<Avatar user={{ username: 'a' }} size={56} />);
        expect(container.firstChild).toHaveStyle({ width: '56px', height: '56px' });
    });
});
