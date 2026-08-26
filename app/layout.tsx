import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// Geometrische sans-serif als webfallback voor Century Gothic (propriëtair,
// geen weblicentie beschikbaar) — zie STYLE.md.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VakantiePlanner",
  description: "Teamverlofplanning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={poppins.variable}>
      <body className="min-h-screen bg-white font-sans text-brand-grey">
        {children}
      </body>
    </html>
  );
}
