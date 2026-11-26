import { useId, type InputHTMLAttributes } from "react";

type KolomIsianProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: string;
  keterangan?: string;
  galat?: string;
};

export function KolomIsian({
  label,
  keterangan,
  galat,
  className = "",
  ...props
}: KolomIsianProps) {
  const id = useId();
  const idKeterangan = keterangan ? `${id}-keterangan` : undefined;
  const idGalat = galat ? `${id}-galat` : undefined;
  const dijelaskanOleh =
    [idKeterangan, idGalat].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-kecil font-medium text-teks">
        {label}
      </label>
      {keterangan && (
        <p id={idKeterangan} className="text-kecil text-teks-sekunder">
          {keterangan}
        </p>
      )}
      <input
        id={id}
        aria-invalid={galat ? true : undefined}
        aria-describedby={dijelaskanOleh}
        className="min-h-11 rounded-dasar border border-garis-kontrol bg-latar px-3 py-2 text-isi text-teks placeholder:text-teks-sekunder aria-invalid:border-2 aria-invalid:border-bahaya disabled:cursor-not-allowed disabled:bg-permukaan disabled:text-teks-sekunder"
        {...props}
      />
      {galat && (
        <p id={idGalat} className="text-kecil text-bahaya">
          {galat}
        </p>
      )}
    </div>
  );
}
