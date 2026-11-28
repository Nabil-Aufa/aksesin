import type { Metadata } from "next";
import {
  Atkinson_Hyperlegible_Next,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";

const fontJudul = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const fontIsi = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson-hyperlegible",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fontAngka = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["600"],
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
    <html
      lang="id"
      className={`${fontJudul.variable} ${fontIsi.variable} ${fontAngka.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#konten-utama"
          className="sr-only rounded-kontrol bg-primer px-4 py-3 font-bold text-latar focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
        >
          Lewati ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
