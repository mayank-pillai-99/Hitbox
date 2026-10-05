import { Inter, Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Archivo has a width axis, which the display style uses for its wide, heavy headings.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono-face" });

export const metadata = {
    title: "Hitbox",
    description: "Track your gaming journey",
};

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
