export type StatusFasilitas =
  | "tersedia"
  | "terbatas"
  | "tidak_tersedia"
  | "tidak_diketahui";

export type TingkatKepercayaan = "tinggi" | "sedang" | "rendah";

export type KategoriKesesuaian =
  | "sesuai"
  | "sebagian_sesuai"
  | "kurang_sesuai"
  | "tidak_sesuai"
  | "belum_cukup_data";

export type Deteksi = {
  label: string;
  keyakinan: number;
  bbox: { x: number; y: number; w: number; h: number };
};
