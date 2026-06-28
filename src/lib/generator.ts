interface GeneratedDraftResult {
  title: string;
  description: string;
  hint: string;
  solution: string;
  flag: string;
  point: number;
}

export async function generateChallengeDraft(
  prompt: string,
  category: string,
  difficulty: string
): Promise<GeneratedDraftResult> {
  const pLower = prompt.toLowerCase();
  
  // Set default points based on difficulty
  let point = 50;
  if (difficulty === 'MEDIUM') point = 150;
  if (difficulty === 'HARD') point = 300;

  // Initialize draft components
  let title = '';
  let description = '';
  let hint = '';
  let solution = '';
  let flag = '';

  // Generate a random flag suffix for uniqueness
  const rand = Math.floor(1000 + Math.random() * 9000);

  if (category === 'WEB') {
    if (pLower.includes('sqli') || pLower.includes('sql') || pLower.includes('injection')) {
      title = `SQL Injection: ${pLower.includes('union') ? 'Union Based Extraction' : 'Authentication Bypass'}`;
      flag = `CTF{sqli_generated_challenge_${rand}}`;
      
      if (pLower.includes('union')) {
        description = `### Deskripsi
Terdapat endpoint pencarian produk siber \`/api/products?search=...\` yang rentan terhadap SQL Injection tipe UNION-based. Aplikasi web menggunakan database SQLite di backend.
Tugas Anda adalah mengekstrak skema tabel dan menemukan flag rahasia yang disimpan dalam tabel \`secrets\`.

### Konseptual Lab
- URL Pencarian: \`/api/products?search=test\`
- Query Backend: \`SELECT id, name, description FROM products WHERE name LIKE '%test%'\`

Ekstrak baris tabel \`secrets\` untuk mendapatkan bendera.`;
        hint = 'Gunakan query UNION SELECT untuk menyisipkan kolom data tambahan. Anda harus menyamakan jumlah kolom (3 kolom) dan tipe datanya.';
        solution = `1. Cek jumlah kolom dengan order by: search=test' ORDER BY 3 -- (berhasil), search=test' ORDER BY 4 -- (gagal). Kolom berjumlah 3.
2. Cari nama tabel: search=test' UNION SELECT 1, sqlite_version(), 3 --
3. Ekstrak dari sqlite_master: search=test' UNION SELECT 1, tbl_name, 3 FROM sqlite_master -- (menemukan tabel bernama 'secrets').
4. Ekstrak data: search=test' UNION SELECT 1, secret_val, 3 FROM secrets --
5. Flag '${flag}' akan tertera.`;
      } else {
        description = `### Deskripsi
Diberikan sebuah halaman login administrator yang memvalidasi kredensial pengguna menggunakan query SQL mentah yang digabung langsung secara dinamis.
Tembus halaman login tersebut tanpa mengetahui kata sandi asli administrator.

### Konseptual Lab
- Endpoint: \`/api/admin/login\`
- Parameter: \`username\` dan \`password\`
- Query Rentan: \`SELECT * FROM users WHERE username = '\` + username + \`' AND password = '\` + password + \`'\``;
        hint = 'Gunakan tanda kutip tunggal (\') untuk memutus string query SQL, lalu buat kondisi logika OR yang selalu bernilai benar (TRUE).';
        solution = `1. Masukkan payload pada kolom username: admin' OR '1'='1 --
2. Kosongkan kolom password.
3. Kirim permintaan login.
4. Karena bagian setelah '--' adalah komentar, database mengevaluasi query menjadi: SELECT * FROM users WHERE username = 'admin' OR '1'='1'
5. Anda akan berhasil login dan sistem akan memberikan flag '${flag}'.`;
      }
    } else if (pLower.includes('xss') || pLower.includes('cross') || pLower.includes('scripting')) {
      title = `Cross-Site Scripting (XSS): ${pLower.includes('stored') ? 'Stored Alert' : 'Reflected Echo'}`;
      flag = `CTF{xss_generated_challenge_${rand}}`;
      description = `### Deskripsi
Sebuah portal ulasan pengguna menampilkan input langsung dari pengunjung di halaman web tanpa penyaringan sanitasi tag HTML.
Tugas Anda adalah memicu eksekusi JavaScript di peramban (browser) korban (simulasi bot admin) dengan memanggil fungsi \`alert()\` untuk mendapatkan cookie flag.

### Konseptual Lab
- ${pLower.includes('stored') ? 'Halaman Buku Tamu: Ulasan disimpan dan ditampilkan ke semua pengunjung.' : 'Kolom Pencarian: Input dipantulkan kembali di halaman hasil pencarian.'}
- Target: Kirim payload XSS yang memanggil \`alert(document.cookie)\`.`;
      hint = 'Gunakan tag HTML <script> standar untuk menyisipkan kode JavaScript yang akan dieksekusi oleh peramban.';
      solution = `1. Masukkan payload berikut pada input yang rentan: <script>alert(document.cookie)</script>
2. Simpan ulasan atau kirim pencarian.
3. Script akan berjalan dan bot admin yang mengunjungi halaman tersebut akan mengirimkan session cookie yang berisi flag: ${flag}.`;
    } else if (pLower.includes('idor') || pLower.includes('access') || pLower.includes('control')) {
      title = 'Insecure Direct Object Reference (IDOR)';
      flag = `CTF{idor_generated_challenge_${rand}}`;
      description = `### Deskripsi
Sebuah portal dokumen invoice melayani unduhan berkas melalui tautan URL dengan ID integer terurut.
Tautan Anda: \`/api/invoice/download?id=125\`
Sebagai pengguna biasa, Anda hanya boleh mengakses invoice Anda sendiri. Cari invoice milik administrator (ID = 1) untuk mencuri data sensitif mereka.

### Konseptual Lab
- Temukan kerentanan otorisasi dengan mengubah nilai parameter \`id\` langsung di URL.`;
      hint = 'Coba ganti parameter query ID dari 125 menjadi 1. Periksa apakah server memverifikasi kepemilikan dokumen tersebut.';
      solution = `1. Buka browser atau tab terminal.
2. Lakukan request GET ke URL: /api/invoice/download?id=1
3. Server tidak memverifikasi kepemilikan dokumen dan mengembalikan invoice milik admin yang berisi flag: ${flag}.`;
    } else {
      title = 'Broken Access Control: Admin Endpoint';
      flag = `CTF{bac_generated_challenge_${rand}}`;
      description = `### Deskripsi
Developer membuat panel admin rahasia di endpoint \`/secret-admin\`. Halaman tersebut menyembunyikan navigasi di antarmuka depan (frontend) tetapi tidak mengamankan rute backend.
Temukan jalan masuk ke panel admin tersebut untuk mengambil flag.`;
      hint = 'Gunakan inspect element atau baca source code JavaScript front-end untuk mencari rute internal tersembunyi.';
      solution = `1. Buka Developer Tools di browser.
2. Cari rute rute web di berkas JavaScript bundler.
3. Temukan rute tersembunyi '/secret-admin'.
4. Buka URL tersebut, periksa bagian response header atau element halaman untuk menemukan flag: ${flag}.`;
    }
  } else if (category === 'CRYPTO') {
    if (pLower.includes('caesar') || pLower.includes('rot')) {
      title = 'Classical Cipher: Caesar Shift';
      flag = `CTF{caesar_generated_challenge_${rand}}`;
      description = `### Deskripsi
Sebuah pesan dienkripsi dengan metode Caesar Cipher klasik dengan pergeseran tertentu.
Ciphertext: \`${caesarEncrypt(flag, 5)}\`
Dekripsi teks tersebut untuk mendapatkan flag asli. (Shift = 5)`;
      hint = 'Karena pesan digeser maju sebanyak 5 langkah, Anda harus menggeser kembali setiap huruf alfabet ke belakang sebanyak 5 langkah (A -> V, B -> W, dst).';
      solution = `Gunakan program parser Caesar Cipher atau tools online seperti CyberChef. Pilih operasi ROT dengan pergeseran -5 (atau 21). Hasil dekripsi akan mengembalikan flag: ${flag}.`;
    } else if (pLower.includes('rsa') || pLower.includes('prime')) {
      title = 'Asymmetric Crypto: Small RSA';
      flag = `CTF{rsa_generated_challenge_${rand}}`;
      description = `### Deskripsi
Diberikan parameter RSA publik yang berukuran kecil. Dekripsi ciphertext \`C\` menjadi plaintext (yang merupakan flag).
- \`p\` = 61
- \`q\` = 53
- \`e\` = 17
- \`C\` = 2201`;
      hint = '1. Hitung modulus N = p * q. 2. Hitung phi(N) = (p-1)*(q-1). 3. Cari kunci privat d (invers modular e terhadap phi(N)). 4. Dekripsi C^d mod N.';
      solution = `1. N = 61 * 53 = 3233.
2. phi(N) = 60 * 52 = 3120.
3. d = modInverse(17, 3120) = 2753.
4. M = 2201^2753 mod 3233 = 1337.
5. Flag Anda adalah: ${flag}`;
    } else {
      title = 'Symmetric Crypto: XOR Cipher';
      flag = `CTF{xor_generated_challenge_${rand}}`;
      description = `### Deskripsi
Pesan berikut di-XOR dengan kunci satu karakter berulang.
Ciphertext (hex): \`${xorEncrypt(flag, 42)}\`
Cari kuncinya dan dapatkan flag asli.`;
      hint = 'Karena Anda mengetahui format awal flag adalah "CTF{", Anda dapat melakukan XOR antara karakter pertama ciphertext dengan "C" untuk menemukan kunci XOR.';
      solution = `1. Ambil biner/hex pertama 'C'.
2. Lakukan XOR antara karakter pertama ciphertext hex dan 'C' (ASCII 67).
3. Anda akan menemukan kunci XOR desimal 42.
4. Lakukan operasi XOR pada seluruh data hex dengan key 42 untuk mendapatkan flag: ${flag}`;
    }
  } else if (category === 'FORENSICS') {
    title = 'Forensics: Hidden in Metadata';
    flag = `CTF{forensics_generated_challenge_${rand}}`;
    description = `### Deskripsi
Kami mengunduh gambar bukti kejahatan dari server tersangka. Kami menduga ada pesan tersembunyi yang disematkan dalam metadata gambar tersebut.
Unduh lampiran gambar dan analisis metadatanya.`;
    hint = 'Gunakan perkakas penganalisis metadata file gambar seperti ExifTool atau jalankan perintah "strings" pada terminal.';
    solution = `1. Jalankan perintah terminal: exiftool gambar.jpg
2. Periksa kolom metadata seperti "Author", "Comment", atau "Description".
3. Anda akan menemukan flag tertulis di kolom Comment: ${flag}`;
  } else if (category === 'OSINT') {
    title = 'OSINT: Location Hunting';
    flag = `CTF{osint_generated_challenge_${rand}}`;
    description = `### Deskripsi
Temukan nama jembatan gantung terkenal yang diresmikan pada tahun 1937 di San Francisco, California.
Format Flag: \`CTF{nama_jembatan_huruf_kecil_spasi_diganti_underscore}\``;
    hint = 'Gunakan mesin pencari Google dengan kata kunci pencarian jembatan gantung San Francisco 1937.';
    solution = `Jembatan tersebut adalah Golden Gate Bridge. Format menjadi huruf kecil dengan underscore: CTF{golden_gate_bridge}.`;
    flag = `CTF{golden_gate_bridge}`;
  } else {
    title = 'Miscellaneous: Git History';
    flag = `CTF{git_history_generated_${rand}}`;
    description = `### Deskripsi
Developer tidak sengaja mengunggah flag rahasia ke repositori git publik, lalu menghapusnya di commit terbaru.
Tugas Anda adalah memeriksa riwayat commit git untuk menemukan data yang dihapus tersebut.`;
    hint = 'Gunakan perintah "git log -p" atau "git reflog" untuk memeriksa semua perubahan commit historis.';
    solution = `Jalankan perintah git log -p di dalam folder repositori git. Anda akan melihat perubahan baris merah (dihapus) yang menunjukkan flag: ${flag}`;
  }

  return {
    title,
    description,
    hint,
    solution,
    flag,
    point,
  };
}

// Utility to encrypt Caesar
function caesarEncrypt(str: string, shift: number): string {
  return str
    .split('')
    .map(char => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return char;
    })
    .join('');
}

// Utility to encrypt XOR and return hex
function xorEncrypt(str: string, key: number): string {
  return str
    .split('')
    .map(char => {
      const xored = char.charCodeAt(0) ^ key;
      const hex = xored.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    })
    .join('');
}
