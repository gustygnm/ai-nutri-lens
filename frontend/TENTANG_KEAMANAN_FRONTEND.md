# ⚠️ PENTING: Mitos "Enkripsi" di Frontend

Anda meminta untuk "mengenkripsi" API Key agar lebih aman. Saya telah menerapkan teknik **Obfuscation (Pengaburan)** menggunakan Base64 di pembaruan ini, namun Anda **WAJIB MEMAHAMI** hal berikut:

### Di Frontend (React/Browser), Tidak Ada Enkripsi yang Benar-benar Aman

Jika aplikasi Anda memanggil Gemini API langsung dari browser pengguna (seperti yang kita lakukan sekarang karena keterbatasan environment sandbox), maka browser **harus mengetahui API Key yang asli** untuk dikirimkan ke server Google.

Jika kita mengenkripsi kunci tersebut, kita juga harus meletakkan **kunci dekripsi (decryption key)** dan **logika dekripsinya** di dalam kode frontend agar browser bisa membukanya. 

Karena semua kode frontend bisa dilihat oleh pengguna (melalui Inspect Element / Developer Tools), peretas (hacker) yang pintar bisa dengan mudah:
1. Melihat kode Anda.
2. Menemukan kunci dekripsi.
3. Menjalankan fungsi dekripsi Anda sendiri untuk mendapatkan API Key Gemini yang asli.

### Apa yang Saya Lakukan di Pembaruan Ini?

Saya mengubah sistem agar API Key tidak lagi ditulis dalam teks biasa (plain text) di file konfigurasi. 
1. Saat Docker berjalan, ia akan mengubah API Key Anda menjadi format **Base64** (dikaburkan).
2. Di dalam kode React (`geminiService.ts`), aplikasi akan membaca teks Base64 tersebut dan mengembalikannya ke teks asli menggunakan fungsi `atob()` tepat sebelum memanggil Gemini.

**Apakah ini aman?**
Ini **LEBIH BAIK** daripada menaruhnya dalam teks biasa karena bot/scanner otomatis (yang mencari teks berawalan `AIzaSy...`) tidak akan langsung menemukannya. 

Namun, ini **TIDAK AMAN** dari peretas manusia. Siapapun yang mengerti JavaScript bisa melihat fungsi `atob()` di kode Anda dan melakukan decode sendiri.

### Solusi Jangka Panjang (Production)
Satu-satunya cara 100% aman untuk menyembunyikan API Key adalah menggunakan **Backend Server** (seperti yang kita coba sebelumnya dengan `server.js`). Jika Anda mendeploy ini ke production sungguhan (misal: Vercel, Netlify, atau Cloud Run yang mendukung Docker multi-container), Anda harus memisahkan frontend dan backend.
