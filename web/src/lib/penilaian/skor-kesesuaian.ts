export type KodeFitur =
    | 'akses_masuk'
    | 'lebar_pintu'
    | 'ramp'
    | 'jalur_bebas_tangga'
    | 'toilet_aksesibel'
    | 'lift'
    | 'parkir_aksesibel'

export type StatusFasilitas = 
    'tersedia' 
    | 'terbatas' 
    | 'tidak_tersedia' 
    | 'tidak_diketahui'

export type HasilKriteria = 'terpenuhi' | 'sebagian' | 'tidak_terpenuhi' | 'tidak_diketahui'

export type KategoriKesesuaian =
    | 'sesuai'
    | 'sebagian_sesuai'
    | 'kurang_sesuai'
    | 'tidak_sesuai'
    | 'belum_cukup_data'

export interface ProfilPengguna {
    tinggiUndakanMaksCm?: number
    lebarPintuMinCm?: number
    butuhRamp?: boolean
    butuhJalurBebasTangga?: boolean
    butuhToiletAksesibel?: boolean
    butuhLift?: boolean
    butuhParkirAksesibel?: boolean
}

export interface FasilitasTempat {
    status: StatusFasilitas
    nilaiNumerik?: number | null
    confidenceEfektif?: number
}

export type DataFasilitasTempat = Partial<Record<KodeFitur, FasilitasTempat>>

export interface RincianKriteria {
    kode: KodeFitur
    nama: string
    bobot: number
    hasil: HasilKriteria
    syarat: string
    kondisiTempat: string
    kepercayaanRendah: boolean
}

export interface HasilPenilaian {
    skor: number | null
    kategori: KategoriKesesuaian
    kelengkapan: number
    jumlahKebutuhan: number
    jumlahTerpenuhi: number
    kriteria: RincianKriteria[]
    dihitungPada: string
}

const METADATA_FITUR: Record<KodeFitur, { nama: string; bobot: number }> = {
    akses_masuk: { nama: 'Akses Masuk', bobot: 3 },
    lebar_pintu: { nama: 'Lebar Pintu', bobot: 3 },
    ramp: { nama: 'Ramp', bobot: 2 },
    jalur_bebas_tangga: { nama: 'Jalur Bebas Tangga', bobot: 2 },
    toilet_aksesibel: { nama: 'Toilet Aksesibel', bobot: 2 },
    lift: { nama: 'Lift', bobot: 1 },
    parkir_aksesibel: { nama: 'Parkir Aksesibel', bobot: 1 },
}

export function hitungKesesuaian(
    profil: ProfilPengguna,
    fasilitas: DataFasilitasTempat,
    waktuPenilaian?: string
): HasilPenilaian {
    const kriteriaList: RincianKriteria[] = []

  // 1. Tentukan fitur yang berlaku
    const fiturBerlaku: KodeFitur[] = ['akses_masuk', 'lebar_pintu']
    if (profil.butuhRamp) fiturBerlaku.push('ramp')
    if (profil.butuhJalurBebasTangga) fiturBerlaku.push('jalur_bebas_tangga')
    if (profil.butuhToiletAksesibel) fiturBerlaku.push('toilet_aksesibel')
    if (profil.butuhLift) fiturBerlaku.push('lift')
    if (profil.butuhParkirAksesibel) fiturBerlaku.push('parkir_aksesibel')

    let bobotTotal = 0
    let bobotDiketahui = 0
    let totalBobotNilai = 0
    let jumlahTerpenuhi = 0

  for (const kode of fiturBerlaku) {
    const meta = METADATA_FITUR[kode]
    const data = fasilitas[kode] || { status: 'tidak_diketahui', confidenceEfektif: 0.8 }
    const confidence = data.confidenceEfektif ?? 0.8
    const status = data.status

    let hasil: HasilKriteria = 'tidak_diketahui'
    let kepercayaanRendah = false

    // Evaluasi 8 aturan berurutan sesuai dokumen
    if (confidence < 0.25) {
      hasil = 'tidak_diketahui'
      kepercayaanRendah = true
    } else if (status === 'tidak_diketahui') {
      hasil = 'tidak_diketahui'
    } else if (status === 'tidak_tersedia') {
      hasil = 'tidak_terpenuhi'
    } else if (kode === 'akses_masuk' && data.nilaiNumerik !== undefined && data.nilaiNumerik !== null) {
      const maks = profil.tinggiUndakanMaksCm ?? 3
      hasil = data.nilaiNumerik <= maks ? 'terpenuhi' : 'tidak_terpenuhi'
    } else if (kode === 'lebar_pintu' && (data.nilaiNumerik === undefined || data.nilaiNumerik === null)) {
      hasil = 'tidak_diketahui'
    } else if (kode === 'lebar_pintu' && data.nilaiNumerik !== undefined && data.nilaiNumerik !== null) {
      const min = profil.lebarPintuMinCm ?? 80
      hasil = data.nilaiNumerik >= min ? 'terpenuhi' : 'tidak_terpenuhi'
    } else if (status === 'tersedia') {
      hasil = 'terpenuhi'
    } else if (status === 'terbatas') {
      hasil = 'sebagian'
    }

    // Tentukan string syarat dan kondisi tempat
    let syarat = 'Wajib tersedia'
    if (kode === 'akses_masuk') syarat = `Undakan maksimal ${profil.tinggiUndakanMaksCm ?? 3} cm`
    if (kode === 'lebar_pintu') syarat = `Lebar pintu minimal ${profil.lebarPintuMinCm ?? 80} cm`

    let kondisiTempat = 'Belum diketahui'
    if (status === 'tersedia') kondisiTempat = 'Tersedia'
    if (status === 'terbatas') kondisiTempat = 'Terbatas'
    if (status === 'tidak_tersedia') kondisiTempat = 'Tidak tersedia'
    if (kode === 'akses_masuk' && data.nilaiNumerik !== undefined && data.nilaiNumerik !== null) {
      kondisiTempat = data.nilaiNumerik === 0 ? 'Tanpa undakan' : `Undakan ${data.nilaiNumerik} cm`
    }
    if (kode === 'lebar_pintu' && data.nilaiNumerik !== undefined && data.nilaiNumerik !== null) {
      kondisiTempat = `Lebar pintu ${data.nilaiNumerik} cm`
    }

    let nilaiNumerikHasil = 0
    if (hasil === 'terpenuhi') {
      nilaiNumerikHasil = 1
      jumlahTerpenuhi++
    } else if (hasil === 'sebagian') {
      nilaiNumerikHasil = 0.5
    }

    bobotTotal += meta.bobot
    if (hasil !== 'tidak_diketahui') {
      bobotDiketahui += meta.bobot
      totalBobotNilai += meta.bobot * nilaiNumerikHasil
    }

    kriteriaList.push({
        kode,
        nama: meta.nama,
        bobot: meta.bobot,
        hasil,
        syarat,
        kondisiTempat,
        kepercayaanRendah,
    })
  }

  const kelengkapan = Number((bobotDiketahui / bobotTotal).toFixed(2))
  const skorMentah = (100 * totalBobotNilai) / bobotTotal
  const skorBulat = Math.round(skorMentah)

  let kategori: KategoriKesesuaian = 'kurang_sesuai'
  let skorTampil: number | null = skorBulat

  const adaTidakTerpenuhi = kriteriaList.some((k) => k.hasil === 'tidak_terpenuhi')

  if (adaTidakTerpenuhi) {
    kategori = 'tidak_sesuai'
    skorTampil = Math.min(skorBulat, 39)
  } else if (kelengkapan < 0.5) {
    kategori = 'belum_cukup_data'
    skorTampil = null
  } else if (skorBulat >= 80 && kelengkapan === 1) {
    kategori = 'sesuai'
    skorTampil = skorBulat
  } else if (skorBulat >= 50) {
    kategori = 'sebagian_sesuai'
    skorTampil = skorBulat
  } else {
    kategori = 'kurang_sesuai'
    skorTampil = skorBulat
  }

  return {
    skor: skorTampil,
    kategori,
    kelengkapan,
    jumlahKebutuhan: fiturBerlaku.length,
    jumlahTerpenuhi,
    kriteria: kriteriaList,
    dihitungPada: waktuPenilaian || new Date().toISOString(),
  }
}