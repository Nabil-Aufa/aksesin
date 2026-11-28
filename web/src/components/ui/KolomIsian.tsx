import { useId, type InputHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";

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
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-kecil font-bold text-tinta">
        {label}
      </label>
      {keterangan && (
        <p id={idKeterangan} className="-mt-1 text-kecil text-teks-sekunder">
          {keterangan}
        </p>
      )}
      <input
        id={id}
        aria-invalid={galat ? true : undefined}
        aria-describedby={dijelaskanOleh}
        className="min-h-12 rounded-kontrol border border-garis-kontrol bg-latar px-4 py-2 text-isi text-tinta placeholder:text-teks-sekunder aria-invalid:border-2 aria-invalid:border-bahaya disabled:cursor-not-allowed disabled:bg-permukaan disabled:text-teks-sekunder"
        {...props}
      />
      {galat && (
        <p id={idGalat} className="flex items-start gap-1 text-kecil text-bahaya">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {galat}
        </p>
      )}
    </div>
  );
}
