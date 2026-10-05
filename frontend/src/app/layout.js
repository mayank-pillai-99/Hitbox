import { Inter, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { SITE_URL } from '@/utils/site';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Archivo has a width axis, which the display style uses for its wide, heavy headings.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face" });

export const metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: "Hitbox: track, review and share the games you play", template: "%s | Hitbox" },
    description: "Log the games you play, write reviews, build lists and follow other players.",
    openGraph: { siteName: "Hitbox", type: "website" },
    twitter: { card: "summary" },
};

export const viewport = { themeColor: "#0b0b0c", colorScheme: "dark" };

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${inter.variable} ${archivo.variable} ${mono.variable}`}>
            <body className="font-sans min-h-screen">
                <AuthProvider>
                    <ToastProvider>
                        {children}
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
