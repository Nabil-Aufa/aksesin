import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";

type VarianTombol = "primer" | "sekunder";

type TombolProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  varian?: VarianTombol;
  memuat?: boolean;
};

const kelasVarian: Record<VarianTombol, string> = {
  primer:
    "border-primer bg-primer text-latar hover:bg-teks hover:border-teks disabled:border-garis-dekoratif disabled:bg-permukaan disabled:text-teks-sekunder",
  sekunder:
    "border-primer bg-latar text-primer hover:bg-primer-muda disabled:border-garis-dekoratif disabled:bg-permukaan disabled:text-teks-sekunder",
};

export function Tombol({
  varian = "primer",
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
      className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-dasar border-2 px-4 py-2 text-isi font-semibold transition-colors disabled:cursor-not-allowed ${kelasVarian[varian]} ${className}`}
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
