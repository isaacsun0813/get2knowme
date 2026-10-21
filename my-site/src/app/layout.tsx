import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const handwriting = localFont({
  src: "../../public/fonts/PatrickHand-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-hand",
  display: "swap",
});
const display = localFont({
  src: "../../public/fonts/GochiHand-Regular.ttf",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Isaac's World — a personal atlas",
  description:
    "Five places that shaped Isaac Sun. Explore a small world of engineering, adventures, projects, and things still being figured out.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${handwriting.variable} ${display.variable}`}>
        {children}
      </body>
    </html>
  );
}
