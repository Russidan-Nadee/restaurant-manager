import type { Metadata } from "next";
import { Noto_Sans_Thai, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const display = Plus_Jakarta_Sans({
  variable: "--font-display", subsets: ["latin"], display: "swap",
});
const ui = Noto_Sans_Thai({
  variable: "--font-ui", subsets: ["thai", "latin"], display: "swap",
});

export const metadata: Metadata = {
  title: "Your name Restaurant",
  description: "Restaurant ordering and management system",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={display.variable + " " + ui.variable}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
