# 📖 Flashcard & Quiz App

Aplikasi mobile berbasis **React Native** dan **Expo** yang dirancang untuk membantu pengguna belajar menggunakan kartu pengingat (flashcard) interaktif dan permainan kuis pilihan ganda. Aplikasi ini memanfaatkan penyimpanan lokal yang persisten serta mengonsumsi data kutipan terkenal dari API [DummyJSON Quotes](https://dummyjson.com/quotes).

Proyek ini menggunakan *file-based routing* via **Expo Router** dan telah dioptimalkan agar responsif baik di perangkat mobile (Android/iOS) maupun ketika di-deploy sebagai Web App di Vercel.

---

## ✨ Fitur Utama

* **🏠 Beranda & CRUD Deck Kuis (Home Screen)**
  * **Pembuatan Kuis Kustom**: Pengguna dapat menambahkan deck belajar baru dengan judul dan deskripsi kustom secara dinamis.
  * **Manajemen Deck**: Menghapus deck belajar yang tidak lagi digunakan beserta seluruh kartu di dalamnya secara aman.
  * **⚡ Impor Kuis Instan (Quotes API)**: Tombol import untuk mengambil kutipan terkenal secara dinamis dari DummyJSON Quotes API dan mengubahnya menjadi kuis tebak tokoh pembuat kutipan secara otomatis.

* **🎴 Mode Belajar Flashcard (Study Screen)**
  * **Animasi Flip 3D**: Sisi kartu dapat dibalik secara interaktif (Pertanyaan & Jawaban) dengan efek animasi 3D rotasi Y yang halus didukung oleh `react-native-reanimated`.
  * **Evaluasi Mandiri**: Fitur penilaian mandiri ("Sudah Hafal" / "Belum Hafal") untuk menghitung kemajuan belajar.
  * **📳 Haptic Feedback**: Memberikan getaran feedback fisik ringan saat kartu dibalik atau dievaluasi menggunakan `expo-haptics`.

* **🎮 Game Kuis Pilihan Ganda (Quiz Screen)**
  * **Pilihan Ganda Dinamis**: Membuat 4 pilihan jawaban acak secara otomatis berdasarkan kartu-kartu yang ada di dalam deck sebagai pengecoh.
  * **Indikator Skor**: Menampilkan persentase skor hasil akhir permainan kuis setelah menjawab seluruh soal.
  * **Interaksi Hasil**: Opsi untuk mengulangi permainan kuis atau kembali ke detail deck kuis.

* **💾 Database Lokal Persisten**
  * Seluruh data kuis, kartu belajar, dan status hafalan disimpan langsung ke dalam memori perangkat menggunakan `@react-native-async-storage/async-storage` agar data tidak hilang saat aplikasi ditutup.

---

## 🛠️ Tech Stack & Dependencies

Proyek ini dikembangkan menggunakan ekosistem JavaScript modern:

* **Framework Utama:** React Native & Expo (v54)
* **Routing & Navigasi:** Expo Router (File-based Routing)
* **Animasi UI:** React Native Reanimated (v4)
* **Penyimpanan:** `@react-native-async-storage/async-storage`
* **Vibrasi & Sensor:** `expo-haptics`
* **Layouting & Style:** StyleSheet bawaan React Native dengan tema gelap (*slate/dark theme*) yang modern.

---

## 🚀 Cara Menjalankan secara Lokal

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di lingkungan lokal Anda:

### 1. Clone Repository
```bash
git clone https://github.com/gustiaryapriandana31/flashcard-and-quizz.git
cd flashcard-app
```

### 2. Install Dependencies
Pastikan Node.js sudah terinstal, kemudian jalankan:
```bash
npm install
```

### 3. Jalankan Metro Bundler
Mulai server Expo untuk mendeteksi perangkat target:
```bash
npx expo start
```

Di terminal metro bundler, Anda dapat memilih platform target:
* Tekan **`w`** untuk membuka aplikasi di browser (Web platform).
* Tekan **`a`** untuk membuka di emulator Android (memerlukan Android Studio / emulator aktif).
* Tekan **`i`** untuk membuka di simulator iOS (memerlukan macOS & Xcode).
* Scan QR Code di terminal menggunakan aplikasi **Expo Go** pada ponsel fisik Anda.

---

## 🌐 Cara Deploy ke Vercel

Proyek ini telah dilengkapi dengan konfigurasi [vercel.json](file:///d:/Dev/belajar-react-native/flashcard-app/vercel.json) bawaan untuk mendukung deployment satu-klik di Vercel:

1. Hubungkan repositori GitHub Anda ke dashboard **Vercel**.
2. Vercel akan otomatis mendeteksi konfigurasi build:
   * **Build Command**: `npm run build` (menjalankan `expo export`)
   * **Output Directory**: `dist`
3. Klik **Deploy** dan aplikasi web Anda akan live dengan dukungan penuh SPA routing (tidak akan error 404 saat halaman di-refresh).
