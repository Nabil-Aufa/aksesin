import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const akar = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const folderSumber = path.join(akar, "src");
const fileToken = path.join(folderSumber, "app", "globals.css");

const pola = [
  { nama: "warna hex", regex: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/ },
  { nama: "fungsi warna", regex: /\b(?:rgba?|hsla?)\(/ },
  {
    nama: "kelas warna arbitrer",
    regex:
      /\b(?:bg|text|border(?:-[trblxy])?|fill|stroke|ring|outline|from|via|to|shadow|decoration|accent|caret|divide|placeholder)-\[(?:#|rgb|hsl|color:|var\()/,
  },
];

function* telusuri(folder) {
  for (const entri of readdirSync(folder, { withFileTypes: true })) {
    const lokasi = path.join(folder, entri.name);
    if (entri.isDirectory()) yield* telusuri(lokasi);
    else if (/\.(tsx?|css)$/.test(entri.name) && !/\.test\./.test(entri.name)) {
      yield lokasi;
    }
  }
}

const temuan = [];
for (const file of telusuri(folderSumber)) {
  if (file === fileToken) continue;
  readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((baris, i) => {
      for (const { nama, regex } of pola) {
        if (regex.test(baris)) {
          temuan.push(`${path.relative(akar, file).replaceAll(path.sep, "/")}:${i + 1}: ${nama}: ${baris.trim()}`);
        }
      }
    });
}

if (temuan.length > 0) {
  console.error("Warna mentah ditemukan. Pakai token dari src/app/globals.css:");
  for (const t of temuan) console.error(`  ${t}`);
  process.exit(1);
}

console.log("Tidak ada warna mentah di luar src/app/globals.css.");
