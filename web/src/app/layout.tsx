import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Aksesin",
    template: "%s | Aksesin",
  },
  description: "Temukan tempat yang sesuai dengan kebutuhan aksesibilitasmu",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten-utama"
          className="sr-only rounded-dasar bg-primer px-4 py-3 text-latar focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
