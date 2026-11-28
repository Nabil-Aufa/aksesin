import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

type AppBarProps = {
  judul: string;
  tautanKembali?: string;
  aksi?: ReactNode;
};

export function AppBar({ judul, tautanKembali, aksi }: AppBarProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-garis-dekoratif bg-latar">
      <div className="mx-auto flex min-h-14 max-w-konten items-center gap-2 px-4 sm:px-6">
        {tautanKembali && (
          <Link
            href={tautanKembali}
            aria-label="Kembali"
            className="-ml-2 inline-flex size-11 items-center justify-center rounded-kontrol text-tinta hover:bg-permukaan"
          >
            <ArrowLeft aria-hidden="true" className="size-6" />
          </Link>
        )}
        <p className="flex-1 truncate font-judul text-judul-3 text-tinta">{judul}</p>
        {aksi}
      </div>
    </header>
  );
}
