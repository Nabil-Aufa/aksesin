import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const css = readFileSync(
  path.resolve(__dirname, "../../app/globals.css"),
  "utf8",
);

const warna = Object.fromEntries(
  [...css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6});/g)].map((m) => [
    m[1],
    m[2],
  ]),
);

function luminansi(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const kanal = parseInt(hex.slice(i, i + 2), 16) / 255;
    return kanal <= 0.03928
      ? kanal / 12.92
      : ((kanal + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function kontras(a: string, b: string) {
  const [terang, gelap] = [luminansi(a), luminansi(b)].sort((x, y) => y - x);
  return (terang + 0.05) / (gelap + 0.05);
}

// Pasangan dan rasio diambil dari tabel di docs/plans/07-panduan-antarmuka.md.
// Syarat minimal: 4,5 untuk teks, 3 untuk batas komponen interaktif.
const pasangan: [string, string, number, number][] = [
  ["tinta", "latar", 16.69, 4.5],
  ["primer", "latar", 5.96, 4.5],
  ["primer", "primer-muda", 5.39, 4.5],
  ["latar", "primer-tua", 9.53, 4.5],
  ["teks-sekunder", "latar", 6.98, 4.5],
  ["teks-sekunder", "permukaan", 6.45, 4.5],
  ["garis-kontrol", "latar", 3.72, 3],
  ["tinta", "sinyal", 11.71, 4.5],
  ["sukses", "sukses-latar", 4.74, 4.5],
  ["peringatan", "peringatan-latar", 5.37, 4.5],
  ["bahaya", "bahaya-latar", 5.75, 4.5],
];

describe("token warna", () => {
  test.each(pasangan)(
    "%s di atas %s sesuai panduan dan memenuhi WCAG AA",
    (depan, belakang, rasioPanduan, minimal) => {
      const rasio = kontras(warna[depan], warna[belakang]);
      expect(rasio).toBeCloseTo(rasioPanduan, 1);
      expect(rasio).toBeGreaterThanOrEqual(minimal);
    },
  );
});
