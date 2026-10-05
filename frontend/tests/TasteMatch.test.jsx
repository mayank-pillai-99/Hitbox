import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

let state = { data: null, loading: false, error: null };
vi.mock('@/hooks/useApi', () => ({ default: () => state }));

const { default: TasteMatch } = await import('@/components/TasteMatch');
const { formatHours } = await import('@/utils/format');

const game = (id, title) => ({ _id: id, title, coverImage: `https://x/${id}.jpg` });

describe('TasteMatch', () => {
    it('shows nothing when the match cannot be loaded', () => {
        state = { data: null, loading: false, error: new Error('x') };
        const { container } = render(<TasteMatch username="dana" />);
        expect(container).toBeEmptyDOMElement();
    });

    it('shows the percentage, how many games it is based on, and both lists', () => {
        state = {
            loading: false,
            error: null,
            data: {
                shared: 8,
                percent: 82,
                confidence: 'high',
                bothLoved: [{ game: game('1', 'Celeste'), mine: 5, theirs: 5 }],
                disagree: [{ game: game('2', 'Doom'), mine: 5, theirs: 1 }],
            },
        };
        render(<TasteMatch username="dana" />);
        expect(screen.getByLabelText('82 percent match')).toBeInTheDocument();
        expect(screen.getByText('Based on 8 shared games.')).toBeInTheDocument();
        expect(screen.getByText('You both loved')).toBeInTheDocument();
        expect(screen.getByText('You disagree on')).toBeInTheDocument();
        expect(screen.getByText('You 5 / Them 1')).toBeInTheDocument();
        expect(screen.getByTitle('Celeste')).toHaveAttribute('href', '/games/1');
    });

    it('says to treat a small overlap as a hint', () => {
        state = { loading: false, error: null, data: { shared: 1, percent: 100, confidence: 'low', bothLoved: [], disagree: [] } };
        render(<TasteMatch username="dana" />);
        expect(screen.getByText('Only 1 shared game, so treat this as a hint.')).toBeInTheDocument();
        expect(screen.getByText(/low confidence/i)).toBeInTheDocument();
        expect(screen.getByLabelText('100 percent match')).toHaveClass('opacity-50');
        expect(screen.queryByText('You both loved')).toBeNull();
        expect(screen.queryByText('You disagree on')).toBeNull();
    });

    it('explains how to get a match when nothing overlaps', () => {
        state = { loading: false, error: null, data: { shared: 0, percent: null, confidence: 'none', bothLoved: [], disagree: [] } };
        render(<TasteMatch username="dana" />);
        expect(screen.getByText('No games in common yet')).toBeInTheDocument();
        expect(screen.getByText(/rate games dana has rated too/i)).toBeInTheDocument();
    });

    it('shows a placeholder while loading', () => {
        state = { data: null, loading: true, error: null };
        const { container } = render(<TasteMatch username="dana" />);
        expect(container.querySelector('.animate-shimmer')).toBeInTheDocument();
    });
});

describe('formatHours', () => {
    it('shows hours, or a note when unknown', () => {
        expect(formatHours(71)).toBe('~71h');
        expect(formatHours(0.5)).toBe('~0.5h');
        expect(formatHours(null)).toBe('Length unknown');
        expect(formatHours(undefined)).toBe('Length unknown');
    });
});
