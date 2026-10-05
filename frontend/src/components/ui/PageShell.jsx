import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Navbar, a skip link, the page body and the footer. `bare` leaves out the width container,
// for pages (like the home page) that lay out their own full-bleed sections.
export default function PageShell({ children, bare = false, className = '' }) {
    return (
        <div className="min-h-screen flex flex-col bg-ink text-fg">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] btn-primary"
            >
                Skip to content
            </a>
            <Navbar />
            <main id="main" className={`flex-1 ${bare ? '' : 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12'} ${className}`}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
