'use client';

// Last resort: replaces the whole page (including the layout) if the root layout itself fails.
// It can't rely on the app's stylesheet or fonts, so the few styles it needs are inline.
export default function GlobalError({ reset }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b0b0c', color: '#f4f4f0', fontFamily: 'system-ui, sans-serif' }}>
                <main role="alert" style={{ textAlign: 'center', padding: 24 }}>
                    <h1 style={{ fontSize: 32, margin: 0 }}>Hitbox hit a snag</h1>
                    <p style={{ color: '#a8a8b0' }}>Something went wrong. Please try again.</p>
                    <button
                        onClick={reset}
                        style={{ marginTop: 16, minHeight: 44, padding: '0 24px', background: '#c8ff2e', color: '#000', border: 0, fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}
                    >
                        Try again
                    </button>
                </main>
            </body>
        </html>
    );
}
