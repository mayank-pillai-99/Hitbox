import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/utils/api', () => ({ default: { get: vi.fn() } }));

const { default: SearchBox, buildOptions } = await import('@/components/SearchBox');

const results = {
    games: [{ _id: 7, title: 'Celeste', releaseDate: '2018-01-25T00:00:00.000Z' }],
    members: [{ _id: 'm1', username: 'dana' }],
    lists: [{ _id: 'l1', name: 'Cozy picks', gameCount: 3, user: { username: 'dana' } }],
};

const setup = (fetcher) => {
    const user = userEvent.setup();
    render(<SearchBox id="s" fetcher={fetcher} debounceMs={5} />);
    return { user, input: screen.getByRole('combobox') };
};

beforeEach(() => push.mockReset());

describe('buildOptions', () => {
    it('orders games, members and lists, and ends with the full search', () => {
        const options = buildOptions(results, 'cel');
        expect(options.map((o) => o.group)).toEqual(['Games', 'Members', 'Lists', null]);
        expect(options.map((o) => o.href)).toEqual(['/games/7', '/users/dana', '/lists/l1', '/games?search=cel']);
    });

    it('encodes the term in the full-search link', () => {
        expect(buildOptions({}, 'a b&c').at(-1).href).toBe('/games?search=a%20b%26c');
    });

    it('still offers the full search when nothing matched', () => {
        expect(buildOptions({ games: [], members: [], lists: [] }, 'zz')).toHaveLength(1);
    });
});

describe('SearchBox', () => {
    it('is a labelled combobox', () => {
        setup(vi.fn());
        expect(screen.getByLabelText(/search games, members and lists/i)).toBe(screen.getByRole('combobox'));
        expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not search until there are two characters', async () => {
        const fetcher = vi.fn().mockResolvedValue(results);
        const { user, input } = setup(fetcher);
        await user.type(input, 'c');
        await new Promise((r) => setTimeout(r, 30));
        expect(fetcher).not.toHaveBeenCalled();
        expect(screen.queryByRole('listbox')).toBeNull();
    });

    it('waits for typing to pause, then searches once', async () => {
        const fetcher = vi.fn().mockResolvedValue(results);
        const { user, input } = setup(fetcher);
        await user.type(input, 'cel', { delay: 0 });
        await screen.findAllByRole('option');
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(fetcher).toHaveBeenCalledWith('cel');
    });

    it('shows grouped results with headings', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        const options = await screen.findAllByRole('option');
        expect(options).toHaveLength(4);
        expect(screen.getByText('Games')).toBeInTheDocument();
        expect(screen.getByText('Members')).toBeInTheDocument();
        expect(screen.getByText('Lists')).toBeInTheDocument();
        expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    it('moves through the options with the arrow keys, wrapping round', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        await screen.findAllByRole('option');

        await user.keyboard('{ArrowDown}');
        expect(input).toHaveAttribute('aria-activedescendant', 's-opt-0');
        expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

        await user.keyboard('{ArrowUp}{ArrowUp}');
        expect(input).toHaveAttribute('aria-activedescendant', 's-opt-2');
    });

    it('opens the highlighted result on Enter', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        await screen.findAllByRole('option');
        await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
        expect(push).toHaveBeenCalledWith('/users/dana');
        expect(input).toHaveValue('');
    });

    it('goes to the full games search on Enter with nothing highlighted', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        await user.keyboard('{Enter}');
        expect(push).toHaveBeenCalledWith('/games?search=cel');
    });

    it('opens a result when clicked', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        await user.click(await screen.findByRole('option', { name: /Celeste/ }));
        expect(push).toHaveBeenCalledWith('/games/7');
        expect(input).toHaveValue('');
    });

    it('closes the list on Escape, then clears the field on a second Escape', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue(results));
        await user.type(input, 'cel');
        await screen.findAllByRole('option');
        await user.keyboard('{Escape}');
        expect(screen.queryByRole('listbox')).toBeNull();
        expect(input).toHaveValue('cel');
        await user.keyboard('{Escape}');
        expect(input).toHaveValue('');
    });

    it('says so when nothing matches', async () => {
        const { user, input } = setup(vi.fn().mockResolvedValue({ games: [], members: [], lists: [] }));
        await user.type(input, 'zzzz');
        expect(await screen.findByText('No matches.')).toBeInTheDocument();
    });

    it('says so when search fails, and still allows the full search', async () => {
        const { user, input } = setup(() => Promise.reject(new Error('down')));
        await user.type(input, 'cel');
        expect(await screen.findByText(/unavailable/i)).toBeInTheDocument();
        await user.keyboard('{Enter}');
        expect(push).toHaveBeenCalledWith('/games?search=cel');
    });

    it('ignores a slow answer to an older query', async () => {
        let resolveSlow;
        const fetcher = vi.fn((q) =>
            q === 'ce'
                ? new Promise((resolve) => { resolveSlow = () => resolve({ games: [{ _id: 1, title: 'Old answer' }], members: [], lists: [] }); })
                : Promise.resolve({ games: [{ _id: 2, title: 'New answer' }], members: [], lists: [] }),
        );
        const { user, input } = setup(fetcher);
        await user.type(input, 'ce');
        await waitFor(() => expect(fetcher).toHaveBeenCalledWith('ce'));
        await user.type(input, 'l');
        expect(await screen.findByRole('option', { name: /New answer/ })).toBeInTheDocument();

        resolveSlow();
        await new Promise((r) => setTimeout(r, 20));
        expect(screen.queryByRole('option', { name: /Old answer/ })).toBeNull();
        expect(screen.getByRole('option', { name: /New answer/ })).toBeInTheDocument();
    });
});
