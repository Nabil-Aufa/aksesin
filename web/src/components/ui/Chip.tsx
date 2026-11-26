import type { ReactNode } from "react";
import {
  Check,
  CircleAlert,
  CircleCheck,
  CircleHelp,
  CircleX,
  ShieldCheck,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import type {
  KategoriKesesuaian,
  StatusFasilitas,
  TingkatKepercayaan,
} from "@/types/status";

export type NadaChip = "sukses" | "peringatan" | "bahaya" | "netral" | "primer";

const kelasNada: Record<NadaChip, string> = {
  sukses: "bg-sukses-latar text-sukses",
  peringatan: "bg-peringatan-latar text-peringatan",
  bahaya: "bg-bahaya-latar text-bahaya",
  netral: "bg-permukaan text-teks-sekunder",
  primer: "bg-primer-muda text-primer",
};

type ChipProps = {
  nada: NadaChip;
  ikon?: LucideIcon;
  children: ReactNode;
};

export function Chip({ nada, ikon: Ikon, children }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-kecil font-medium ${kelasNada[nada]}`}
    >
      {Ikon && <Ikon aria-hidden="true" className="size-4 shrink-0" />}
      {children}
    </span>
  );
}

type Penanda = { label: string; nada: NadaChip; ikon: LucideIcon };

export const penandaKesesuaian: Record<KategoriKesesuaian, Penanda> = {
  sesuai: { label: "Sesuai", nada: "sukses", ikon: CircleCheck },
  sebagian_sesuai: {
    label: "Sebagian sesuai",
    nada: "peringatan",
    ikon: CircleAlert,
  },
  kurang_sesuai: {
    label: "Kurang sesuai",
    nada: "peringatan",
    ikon: TriangleAlert,
  },
  tidak_sesuai: { label: "Tidak sesuai", nada: "bahaya", ikon: CircleX },
  belum_cukup_data: {
    label: "Belum cukup data",
    nada: "netral",
    ikon: CircleHelp,
  },
};

export const penandaStatusFasilitas: Record<StatusFasilitas, Penanda> = {
  tersedia: { label: "Tersedia", nada: "sukses", ikon: Check },
  terbatas: { label: "Terbatas", nada: "peringatan", ikon: CircleAlert },
  tidak_tersedia: { label: "Tidak tersedia", nada: "bahaya", ikon: X },
  tidak_diketahui: { label: "Belum ada data", nada: "netral", ikon: CircleHelp },
};

export const penandaKepercayaan: Record<TingkatKepercayaan, Penanda> = {
  tinggi: { label: "Kepercayaan tinggi", nada: "sukses", ikon: ShieldCheck },
  sedang: { label: "Kepercayaan sedang", nada: "peringatan", ikon: ShieldCheck },
  rendah: { label: "Kepercayaan rendah", nada: "netral", ikon: ShieldCheck },
};

function ChipPenanda({ penanda }: { penanda: Penanda }) {
  return (
    <Chip nada={penanda.nada} ikon={penanda.ikon}>
      {penanda.label}
    </Chip>
  );
}

export function ChipKesesuaian({ kategori }: { kategori: KategoriKesesuaian }) {
  return <ChipPenanda penanda={penandaKesesuaian[kategori]} />;
}

export function ChipStatusFasilitas({ status }: { status: StatusFasilitas }) {
  return <ChipPenanda penanda={penandaStatusFasilitas[status]} />;
}

export function ChipKepercayaan({ tingkat }: { tingkat: TingkatKepercayaan }) {
  return <ChipPenanda penanda={penandaKepercayaan[tingkat]} />;
}
