"use client";

import { useState } from "react";

const mockPlaces = [
  {
    id: 1,
    name: "Perpustakaan UGM",
    address: "Bulaksumur, Yogyakarta",
    accessibility: ["Ramp", "Lift", "Toilet aksesibel"],
  },
  {
    id: 2,
    name: "Gedung DTETI",
    address: "Fakultas Teknik UGM",
    accessibility: ["Ramp", "Lift"],
  },
  {
    id: 3,
    name: "Gelanggang Inovasi dan Kreativitas UGM",
    address: "Bulaksumur, Yogyakarta",
    accessibility: ["Ramp", "Lift", "Parkir aksesibel"],
  },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const filteredPlaces = mockPlaces.filter((place) =>
    place.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Pencarian Tempat
          </h1>

          <p className="mt-2 text-gray-600">
            Temukan tempat yang sesuai dengan kebutuhan aksesibilitasmu.
          </p>
        </div>

        <div className="mb-6">
          <label
            htmlFor="search-place"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Cari tempat
          </label>

          <input
            id="search-place"
            type="search"
            placeholder="Contoh: Perpustakaan UGM"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm outline-none focus:border-gray-500"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Hasil Pencarian
              </h2>

              <span className="text-sm text-gray-500">
                {filteredPlaces.length} tempat
              </span>
            </div>

            <div className="space-y-4">
              {filteredPlaces.map((place) => (
                <article
                  key={place.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {place.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {place.address}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {place.accessibility.map((feature) => (
                      <span
                        key={feature}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </article>
              ))}

              {filteredPlaces.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <p className="font-medium text-gray-800">
                    Tempat tidak ditemukan
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Coba gunakan kata kunci pencarian yang berbeda.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Peta
            </h2>

            <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-5xl">📍</div>

                <p className="mt-4 font-semibold text-gray-800">
                  Preview Peta Tempat
                </p>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Area ini disiapkan sebagai fondasi integrasi peta interaktif
                  dan data lokasi pada tahap pengembangan berikutnya.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}