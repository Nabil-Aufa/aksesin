import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { Tombol } from "./Tombol";
import { KolomIsian } from "./KolomIsian";
import { ChipKesesuaian } from "./Chip";
import { ringkasanDeteksi } from "./GambarTempat";

function render(elemen: React.ReactElement) {
  const wadah = document.createElement("div");
  wadah.innerHTML = renderToStaticMarkup(elemen);
  return wadah;
}

describe("Tombol", () => {
  test("saat memuat menandai aria-busy dan tetap memuat label", () => {
    const tombol = render(<Tombol memuat>Kirim</Tombol>).querySelector("button")!;
    expect(tombol.getAttribute("aria-busy")).toBe("true");
    expect(tombol.disabled).toBe(true);
    expect(tombol.textContent).toContain("Kirim");
  });

  test("bawaan bertipe button supaya tidak mengirim formulir", () => {
    const tombol = render(<Tombol>Batal</Tombol>).querySelector("button")!;
    expect(tombol.type).toBe("button");
    expect(tombol.hasAttribute("aria-busy")).toBe(false);
  });
});

describe("KolomIsian", () => {
  test("label terhubung ke kolom", () => {
    const wadah = render(<KolomIsian label="Nama tempat" />);
    const label = wadah.querySelector("label")!;
    const kolom = wadah.querySelector("input")!;
    expect(label.htmlFor).toBe(kolom.id);
  });

  test("galat dihubungkan lewat aria-describedby dan aria-invalid", () => {
    const wadah = render(
      <KolomIsian label="Lebar pintu" keterangan="Dalam cm" galat="Wajib diisi" />,
    );
    const kolom = wadah.querySelector("input")!;
    expect(kolom.getAttribute("aria-invalid")).toBe("true");
    const deskripsi = kolom
      .getAttribute("aria-describedby")!
      .split(" ")
      .map((id) => wadah.querySelector(`[id="${id}"]`)?.textContent);
    expect(deskripsi).toEqual(["Dalam cm", "Wajib diisi"]);
  });
});

describe("Chip", () => {
  test("status ditandai dengan teks dan ikon, bukan warna saja", () => {
    const chip = render(<ChipKesesuaian kategori="tidak_sesuai" />);
    expect(chip.textContent).toBe("Tidak sesuai");
    expect(chip.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("ringkasanDeteksi", () => {
  test("menyebut setiap deteksi beserta keyakinannya", () => {
    expect(
      ringkasanDeteksi([
        { label: "ramp", keyakinan: 0.92, bbox: { x: 0, y: 0, w: 1, h: 1 } },
        { label: "toilet_aksesibel", keyakinan: 0.615, bbox: { x: 0, y: 0, w: 1, h: 1 } },
      ]),
    ).toBe("AI mendeteksi 2 fasilitas: ramp 92%, toilet aksesibel 62%.");
  });

  test("memberi tahu jika tidak ada deteksi", () => {
    expect(ringkasanDeteksi([])).toBe("AI tidak mendeteksi fasilitas pada foto ini.");
  });
});

describe("KolomIsian galat", () => {
  test("pesan galat disertai ikon, bukan warna saja", () => {
    const wadah = render(<KolomIsian label="Kata sandi" galat="Minimal 8 karakter" />);
    const galat = wadah.querySelector('[id$="-galat"]')!;
    expect(galat.textContent).toBe("Minimal 8 karakter");
    expect(galat.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });
});
