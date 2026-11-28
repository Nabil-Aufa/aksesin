import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type VarianTombol = "primer" | "sekunder" | "teks";
type UkuranTombol = "normal" | "ringkas";

type TombolProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  varian?: VarianTombol;
  ukuran?: UkuranTombol;
  memuat?: boolean;
};

const kelasNonaktif =
  "disabled:border-garis-dekoratif disabled:bg-permukaan disabled:text-teks-sekunder";

const kelasVarian: Record<VarianTombol, string> = {
  primer: `border-primer bg-primer text-latar hover:border-primer-tua hover:bg-primer-tua ${kelasNonaktif}`,
  sekunder: `border-primer bg-latar text-primer hover:bg-primer-muda ${kelasNonaktif}`,
  teks: "border-transparent bg-transparent text-primer underline-offset-4 hover:bg-primer-muda hover:underline disabled:text-teks-sekunder",
};

const kelasUkuran: Record<UkuranTombol, string> = {
  normal: "min-h-13 px-6",
  ringkas: "min-h-11 px-4",
};

export function Tombol({
  varian = "primer",
  ukuran = "normal",
  memuat = false,
  disabled,
  type = "button",
  className = "",
  children,
  ...props
}: TombolProps) {
  return (
    <button
      type={type}
      disabled={disabled || memuat}
      aria-busy={memuat || undefined}
      className={`relative inline-flex items-center justify-center gap-2 rounded-kontrol border-2 py-2 text-isi font-bold transition-colors disabled:cursor-not-allowed ${kelasUkuran[ukuran]} ${kelasVarian[varian]} ${className}`}
      {...props}
    >
      <span className={`inline-flex items-center gap-2 ${memuat ? "invisible" : ""}`}>
        {children}
      </span>
      {memuat && (
        <LoaderCircle
          aria-hidden="true"
          className="absolute size-5 animate-spin"
        />
      )}
    </button>
  );
}
