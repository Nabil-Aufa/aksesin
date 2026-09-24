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
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Pencarian Tempat
        </h1>

        <p className="mt-2 text-gray-600">
          Temukan tempat yang sesuai dengan kebutuhan aksesibilitasmu.
        </p>

        <div className="mt-6">
          <input
            type="search"
            placeholder="Cari tempat..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
          />
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            Hasil Pencarian
          </h2>

          <div className="mt-4 space-y-4">
            {filteredPlaces.map((place) => (
              <article
                key={place.id}
                className="rounded-xl border border-gray-200 p-5"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {place.name}
                </h3>

                <p className="mt-1 text-gray-600">{place.address}</p>

                <div className="mt-3 flex flex-wrap gap-2">
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
              <p className="text-gray-600">
                Tempat tidak ditemukan.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}