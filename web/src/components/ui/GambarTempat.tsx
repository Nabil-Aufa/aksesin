"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { Deteksi } from "@/types/status";

type GambarTempatProps = {
  src: string;
  alt: string;
  deteksi?: Deteksi[];
};

type KeadaanGambar = "memuat" | "dimuat" | "gagal";

export function persentase(keyakinan: number) {
  return `${Math.round(keyakinan * 100)}%`;
}

export function namaLabel(label: string) {
  return label.replaceAll("_", " ");
}

export function ringkasanDeteksi(deteksi: Deteksi[]) {
  if (deteksi.length === 0) return "AI tidak mendeteksi fasilitas pada foto ini.";
  const daftar = deteksi
    .map((d) => `${namaLabel(d.label)} ${persentase(d.keyakinan)}`)
    .join(", ");
  return `AI mendeteksi ${deteksi.length} fasilitas: ${daftar}.`;
}

export function GambarTempat({ src, alt, deteksi }: GambarTempatProps) {
  const [keadaan, setKeadaan] = useState<KeadaanGambar>("memuat");

  return (
    <figure className="flex flex-col gap-2">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-dasar bg-permukaan">
        {keadaan === "memuat" && (
          <div
            role="status"
            className="absolute inset-0 animate-pulse bg-garis-dekoratif"
          >
            <span className="sr-only">Memuat foto</span>
          </div>
        )}
        {keadaan === "gagal" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-teks-sekunder">
            <ImageOff aria-hidden="true" className="size-8" />
            <p className="text-kecil">Foto gagal dimuat</p>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            sizes="(min-width: 40rem) 40rem, 100vw"
            className="object-cover"
            onLoad={() => setKeadaan("dimuat")}
            onError={() => setKeadaan("gagal")}
          />
        )}
        {keadaan === "dimuat" &&
          deteksi?.map((d, i) => (
            <div
              key={i}
              aria-hidden="true"
              className="absolute border-2 border-primer"
              style={{
                left: `${d.bbox.x * 100}%`,
                top: `${d.bbox.y * 100}%`,
                width: `${d.bbox.w * 100}%`,
                height: `${d.bbox.h * 100}%`,
              }}
            >
              <span className="absolute top-0 left-0 bg-primer px-1 text-mini whitespace-nowrap text-latar">
                {namaLabel(d.label)} {persentase(d.keyakinan)}
              </span>
            </div>
          ))}
      </div>
      {deteksi && keadaan === "dimuat" && (
        <figcaption className="text-kecil text-teks-sekunder">
          {ringkasanDeteksi(deteksi)}
        </figcaption>
      )}
    </figure>
  );
}
