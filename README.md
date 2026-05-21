# Kalkulator Harga Kanopi

Web app untuk admin bengkel las & aluminium. Input ukuran dan jenis kanopi, langsung muncul rincian harga + bisa download PDF penawaran.

## Fitur
- Pilih jenis: Kanopi Minimalis / Talang Profil
- Pilih atap: Alderon Single / Double (harga otomatis)
- Input dimensi panjang × lebar
- Harga satuan bisa diubah manual
- Input nama customer & catatan
- Download PDF penawaran profesional (format A4)
- Responsive mobile & desktop

## Deploy ke Vercel (cara termudah)

### 1. Upload ke GitHub
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/USERNAME/kanopi-calculator.git
git push -u origin main
```

### 2. Deploy ke Vercel
1. Buka https://vercel.com
2. Login / daftar (bisa pakai akun GitHub)
3. Klik **"Add New Project"**
4. Import repo `kanopi-calculator` dari GitHub
5. Klik **Deploy** — selesai!

Vercel akan otomatis build dan deploy. URL langsung aktif.

## Jalankan lokal (development)

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Ubah nama bengkel di PDF

Edit file `pages/index.js`, cari baris:
```
doc.text('Bengkel Las & Aluminium', ...)
```
Ganti dengan nama bengkel kamu.
