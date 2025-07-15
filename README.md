> [!WARNING]
> 🔨 **Ini adalah versi modifikasi terbatas (tanpa `sharp` dan fitur audio seperti TTS dan call).** Hanya mendukung interaksi teks/chat dengan karakter.
>
> 🧪 **Fitur dalam tahap pengembangan.** Silakan buka [issue ini](https://github.com/realcoloride/node_characterai/issues/180) untuk memberi masukan atau melaporkan bug.

# Character AI Node Client (Lite Version)

> Versi ringan dari `node_characterai`, tanpa dukungan untuk audio (TTS/Call) dan manipulasi gambar (`sharp`). Fokus hanya pada pengiriman dan penerimaan pesan teks.

## ✨ Fitur

- ✅ Hanya fitur teks/chat yang diaktifkan
- ✅ Full dukungan TypeScript
- ✅ Menggunakan akses token untuk login
- ✅ Kirim dan terima pesan dari karakter AI
- ✅ Dapat membuat DM baru atau melanjutkan percakapan sebelumnya
- ❌ **Tanpa dukungan TTS / Audio / Call**
- ❌ **Tanpa manipulasi gambar atau avatar menggunakan `sharp`**

---

## 🚀 Instalasi

```bash
npm install github:RyHarJr/node_characterai
```

### Import

```ts
import { CharacterAI } from 'node_characterai';
```

---

## 🔐 Autentikasi

Untuk menggunakan API, kamu perlu mengambil akses token dari `localStorage` seperti pada versi penuh.

```ts
const characterAI = new CharacterAI();
await characterAI.authenticate("YOUR_ACCESS_TOKEN_HERE");
```

> 💡 Gunakan `.env` untuk menyimpan token dengan aman dan hindari membagikannya ke publik.

---

## 💬 Mengobrol dengan Karakter

```ts
const character = await characterAI.fetchCharacter('char_xxxxx'); // Ganti dengan ID karakter
const dm = await character.DM(); // Mulai DM baru atau ambil yang terakhir
const message = await dm.sendMessage("Hello!");
console.log(message.content);
```

---

## 📄 Fitur yang Tidak Tersedia di Versi Ini

Fitur-fitur berikut **tidak** tersedia karena `sharp` dan audio dihapus:

| Fitur                        | Status |
|-----------------------------|--------|
| Text-to-Speech (TTS)        | ❌     |
| Voice call                  | ❌     |
| Image generation/editing    | ❌     |
| Avatar upload/change        | ❌     |
| Sharp manipulation API      | ❌     |
| Audio device management     | ❌     |

Jika kamu membutuhkan fitur di atas, silakan gunakan versi penuh `node_characterai`.

---

## 💡 Tips

- Gunakan `character.DM(chatId)` jika ingin membuka percakapan spesifik.
- Gunakan `message.getCandidates()` jika ingin melihat alternatif jawaban dari AI.

---

## 💬 Dukungan & Kontribusi

Jika kamu mengalami masalah, ingin menyumbang ide, atau ikut berkontribusi:

- 💡 [Laporkan bug atau permintaan fitur](https://github.com/realcoloride/node_characterai/issues)
- 💖 [Dukung pengembang lewat Ko-Fi](https://ko-fi.com/coloride)
- ⭐ Beri bintang di GitHub jika paket ini membantu

---

## ⚠️ Disclaimer

- Proyek ini **tidak terafiliasi dengan Character.AI**.
- Hanya digunakan untuk eksplorasi pribadi dan pengembangan.
- Gunakan dengan tanggung jawab dan patuhi syarat layanan Character.AI.

---

## 📃 Lisensi

MIT © (real)Coloride - Versi modifikasi oleh komunitas