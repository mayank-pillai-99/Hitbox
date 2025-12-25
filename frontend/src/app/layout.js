import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Hitbox",
    description: "Track your gaming journey",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
                {children}
            </body>
        </html>
    );
}
