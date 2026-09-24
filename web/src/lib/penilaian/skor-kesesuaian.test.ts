import { describe, expect, it } from 'vitest'
import { hitungKesesuaian, ProfilPengguna, DataFasilitasTempat } from '../penilaian/skor-kesesuaian'

describe('Algoritma Skor Kesesuaian (K1 - K9)', () => {
  const profilUtama: ProfilPengguna = {
    tinggiUndakanMaksCm: 3,
    lebarPintuMinCm: 80,
    butuhRamp: true,
    butuhJalurBebasTangga: true,
    butuhToiletAksesibel: true,
    butuhParkirAksesibel: true,
  }

  it('K1: Semua tersedia, undakan 0 cm, pintu 90 cm', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tersedia' },
        parkir_aksesibel: { status: 'tersedia' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(100)
    expect(res.kategori).toBe('sesuai')
    expect(res.kelengkapan).toBe(1.0)
    expect(res.jumlahTerpenuhi).toBe(6)
  })

  it('K2: Toilet tidak tersedia', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tidak_tersedia', confidenceEfektif: 0.6 },
        parkir_aksesibel: { status: 'tersedia' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(39)
    expect(res.kategori).toBe('tidak_sesuai')
    expect(res.kelengkapan).toBe(1.0)
    expect(res.jumlahTerpenuhi).toBe(5)
  })

  it('K3: Toilet tidak diketahui dan parkir terbatas', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tidak_diketahui' },
        parkir_aksesibel: { status: 'terbatas' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(81)
    expect(res.kategori).toBe('sebagian_sesuai')
    expect(res.kelengkapan).toBe(0.85)
    expect(res.jumlahTerpenuhi).toBe(4)
  })

  it('K4: Undakan 5 cm (melebihi batas 3 cm)', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 5 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tersedia' },
        parkir_aksesibel: { status: 'tersedia' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(39)
    expect(res.kategori).toBe('tidak_sesuai')
    expect(res.kelengkapan).toBe(1.0)
    expect(res.jumlahTerpenuhi).toBe(5)
  })

  it('K5: Toilet confidence 0.20 (kepercayaan rendah)', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tidak_tersedia', confidenceEfektif: 0.2 },
        parkir_aksesibel: { status: 'tersedia' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(85)
    expect(res.kategori).toBe('sebagian_sesuai')
    expect(res.kelengkapan).toBe(0.85)
    expect(res.jumlahTerpenuhi).toBe(5)
  })

  it('K6: Hanya akses masuk dan pintu yang diketahui', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 90 },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBeNull()
    expect(res.kategori).toBe('belum_cukup_data')
    expect(res.kelengkapan).toBe(0.46)
    expect(res.jumlahTerpenuhi).toBe(2)
  })

  it('K7: Banyak fasilitas terbatas dan tidak diketahui', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'terbatas' },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 85 },
        ramp: { status: 'terbatas' },
        parkir_aksesibel: { status: 'terbatas' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(46)
    expect(res.kategori).toBe('kurang_sesuai')
    expect(res.kelengkapan).toBe(0.69)
    expect(res.jumlahTerpenuhi).toBe(1)
  })

  it('K8: Pintu 78 cm (kurang dari batas min 80 cm)', () => {
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tersedia', nilaiNumerik: 78 },
        ramp: { status: 'tersedia' },
        jalur_bebas_tangga: { status: 'tersedia' },
        toilet_aksesibel: { status: 'tersedia' },
        parkir_aksesibel: { status: 'tersedia' },
    }
    const res = hitungKesesuaian(profilUtama, fasilitas)
    expect(res.skor).toBe(39)
    expect(res.kategori).toBe('tidak_sesuai')
    expect(res.kelengkapan).toBe(1.0)
    expect(res.jumlahTerpenuhi).toBe(5)
  })

  it('K9: Profil lain (undakan max 2 cm, pintu min 75 cm)', () => {
    const profilK9: ProfilPengguna = {
        tinggiUndakanMaksCm: 2,
        lebarPintuMinCm: 75,
    }
    const fasilitas: DataFasilitasTempat = {
        akses_masuk: { status: 'tersedia', nilaiNumerik: 0 },
        lebar_pintu: { status: 'tidak_diketahui' },
    }
    const res = hitungKesesuaian(profilK9, fasilitas)
    expect(res.skor).toBe(50)
    expect(res.kategori).toBe('sebagian_sesuai')
    expect(res.kelengkapan).toBe(0.5)
    expect(res.jumlahTerpenuhi).toBe(1)
  })
})