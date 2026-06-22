const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // Clean existing data
  await prisma.pointTransaction.deleteMany({});
  await prisma.userBadge.deleteMany({});
  await prisma.badge.deleteMany({});
  await prisma.generatedChallengeDraft.deleteMany({});
  await prisma.bugReport.deleteMany({});
  await prisma.bugBountyProgram.deleteMany({});
  await prisma.challengeSubmission.deleteMany({});
  await prisma.challenge.deleteMany({});
  await prisma.courseProgress.deleteMany({});
  await prisma.lesson.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleaned database tables.');

  // Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const bugPasswordHash = await bcrypt.hash('pemburu123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Administrator',
      email: 'admin@ctfforge.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      totalPoint: 0,
    },
  });

  const user = await prisma.user.create({
    data: {
      name: 'Cyber Cadet',
      email: 'user@ctfforge.com',
      passwordHash: userPasswordHash,
      role: 'USER',
      totalPoint: 100, // starting point
    },
  });

  const bugHunter = await prisma.user.create({
    data: {
      name: 'Bug Bounty Hunter',
      email: 'pemburu@ctfforge.com',
      passwordHash: bugPasswordHash,
      role: 'USER',
      totalPoint: 250,
    },
  });

  console.log('Created Users:', { admin: admin.email, user: user.email, bugHunter: bugHunter.email });

  // Create Badges
  const badgeApprentice = await prisma.badge.create({
    data: {
      name: 'Web Security Apprentice',
      description: 'Menyelesaikan semua pelajaran di Course Web Security Basic.',
      iconUrl: '🛡️',
      condition: 'Complete Web Security Course',
    },
  });

  const badgeFirstBlood = await prisma.badge.create({
    data: {
      name: 'First Blood',
      description: 'Berhasil mensubmit flag CTF pertama yang valid.',
      iconUrl: '🩸',
      condition: 'Solve 1 Challenge',
    },
  });

  const badgeBugHunter = await prisma.badge.create({
    data: {
      name: 'Bug Hunter',
      description: 'Laporan bug bounty pertama yang diverifikasi Valid oleh Admin.',
      iconUrl: '🪲',
      condition: 'Get 1 Valid Bug Report',
    },
  });

  console.log('Created Badges.');

  // Create Courses, Modules, Lessons
  // Course 1: Web Security Basic
  const courseWeb = await prisma.course.create({
    data: {
      title: 'Web Security Basic',
      description: 'Pelajari dasar-dasar kerentanan keamanan web, cara kerjanya, dan langkah pencegahannya. Kurikulum ini mencakup SQL Injection, XSS, dan Broken Access Control.',
      level: 'BEGINNER',
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const modWebIntro = await prisma.module.create({
    data: {
      courseId: courseWeb.id,
      title: 'Pengenalan Keamanan Web',
      orderIndex: 1,
    },
  });

  const lesWebIntro1 = await prisma.lesson.create({
    data: {
      moduleId: modWebIntro.id,
      title: 'Apa itu Web Security?',
      content: `### Pengantar Keamanan Web

Keamanan web adalah praktik melindungi situs web dan aplikasi web dari ancaman siber dan kerentanan keamanan. Dalam era digital saat ini, aplikasi web memproses banyak data sensitif, seperti kredensial login, data pribadi, dan transaksi finansial.

#### CIA Triad dalam Keamanan Informasi
Setiap sistem keamanan didasarkan pada tiga pilar utama:
1. **Confidentiality (Kerahasiaan)**: Memastikan hanya pihak berwenang yang dapat mengakses data.
2. **Integrity (Integritas)**: Memastikan data tidak dimodifikasi secara tidak sah selama transit atau penyimpanan.
3. **Availability (Ketersediaan)**: Memastikan layanan web dapat diakses oleh pengguna yang sah saat dibutuhkan.

#### Mengapa Web Rentan?
Aplikasi web rentan karena mereka terpapar langsung ke internet dan sering menerima input dari luar (user input). Jika input tersebut tidak divalidasi atau difilter dengan benar, penyerang dapat memanipulasi jalannya aplikasi untuk mengekstrak data atau menjalankan kode berbahaya.

Langkah pertama dalam belajar web security adalah memahami cara penyerang berpikir dan bagaimana mekanisme pertahanan dibangun.`,
      orderIndex: 1,
    },
  });

  const modSqli = await prisma.module.create({
    data: {
      courseId: courseWeb.id,
      title: 'SQL Injection (SQLi)',
      orderIndex: 2,
    },
  });

  const lesSqliDasar = await prisma.lesson.create({
    data: {
      moduleId: modSqli.id,
      title: 'SQL Injection Dasar',
      content: `### Apa itu SQL Injection?

**SQL Injection (SQLi)** adalah salah satu kerentanan web paling klasik dan berbahaya. Ini terjadi ketika input pengguna dimasukkan langsung ke dalam query SQL tanpa sanitasi atau parameterisasi.

#### Contoh Kerentanan Login Bypass
Bayangkan sebuah query login seperti berikut:
\`\`\`sql
SELECT * FROM users WHERE username = 'INPUT_USER' AND password = 'INPUT_PASSWORD'
\`\`\`

Jika aplikasi tidak memfilter input, penyerang dapat mengisi kolom username dengan:
\`\`\`text
admin' OR '1'='1
\`\`\`

Maka query yang dieksekusi oleh database akan menjadi:
\`\`\`sql
SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password = ''
\`\`\`

Karena '1'='1' selalu bernilai **TRUE**, database akan mengembalikan baris user admin tanpa memerlukan password yang benar. Penyerang berhasil masuk!

#### Jenis-Jenis SQLi:
1. **In-Band SQLi (Classic)**: Hasil query ditampilkan langsung di halaman web.
2. **Inferential (Blind) SQLi**: Halaman web tidak menampilkan data, tetapi perilakunya berubah (berdasarkan waktu respon atau respon True/False).
3. **Out-of-Band SQLi**: Data ditarik keluar melalui jalur komunikasi lain (seperti DNS query).`,
      orderIndex: 1,
    },
  });

  const lesSqliDefense = await prisma.lesson.create({
    data: {
      moduleId: modSqli.id,
      title: 'Mencegah SQL Injection',
      content: `### Cara Mengatasi SQL Injection

SQL Injection sepenuhnya dapat dicegah. Kunci utamanya adalah **memisahkan data dari kode query**.

#### 1. Prepared Statements (Parameterized Queries)
Ini adalah pertahanan utama dan paling efektif. Dengan Prepared Statements, database memperlakukan input pengguna secara ketat sebagai **data**, bukan kode yang dapat dieksekusi.

Contoh di Node.js (mysql2):
\`\`\`javascript
// AMAN: Parameterized Query
const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
db.execute(query, [username, password]);
\`\`\`

#### 2. Penggunaan ORM (Object-Relational Mapping)
Kerangka kerja ORM modern seperti **Prisma**, Sequelize, atau Hibernate secara otomatis menggunakan parameterized queries di balik layar untuk hampir semua operasi bawaannya.

Contoh dengan Prisma:
\`\`\`typescript
// AMAN secara default
const user = await prisma.user.findFirst({
  where: {
    email: emailInput,
  }
});
\`\`\`

#### 3. Input Validation & Escaping
Lakukan filter ketat pada tipe data input (misalnya memastikan parameter ID selalu berupa angka) dan terapkan *escaping* karakter jika parameterized queries tidak dapat digunakan.`,
      orderIndex: 2,
    },
  });

  // Course 2: Cryptography Basic
  const courseCrypto = await prisma.course.create({
    data: {
      title: 'Cryptography Basic',
      description: 'Pahami cara mengamankan data menggunakan teknik enkripsi klasik dan modern. Jelajahi enkripsi simetrik, asimetrik, dan hashing.',
      level: 'BEGINNER',
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const modCryptoBasic = await prisma.module.create({
    data: {
      courseId: courseCrypto.id,
      title: 'Dasar Kriptografi',
      orderIndex: 1,
    },
  });

  const lesCryptoClassical = await prisma.lesson.create({
    data: {
      moduleId: modCryptoBasic.id,
      title: 'Klasik vs Modern Cipher',
      content: `### Kriptografi Klasik vs Modern

Kriptografi adalah ilmu tentang pengamanan pesan. Teknik kriptografi terbagi menjadi era klasik (berbasis kertas dan pena) dan era modern (berbasis bit komputer).

#### Kriptografi Klasik
Kriptografi klasik beroperasi pada tingkat karakter (huruf) dan menggunakan manipulasi manual yang sederhana:
- **Substitution Cipher**: Mengganti satu karakter dengan karakter lain. Contohnya adalah **Caesar Cipher** (menggeser huruf sebanyak N posisi).
- **Transposition Cipher**: Mengacak urutan huruf dari pesan asli tanpa mengubah hurufnya sendiri. Contohnya adalah *Rail Fence Cipher*.

#### Caesar Cipher
Misalkan pergeseran key = 3.
- Plaintext: \`CAT\`
- Ciphertext: \`FDW\` (C->F, A->D, T->W)

Kerentanan utama kriptografi klasik adalah rentan terhadap **Frequency Analysis** (menganalisis frekuensi kemunculan huruf dalam bahasa tertentu).

#### Kriptografi Modern
Kriptografi modern beroperasi pada tingkat biner (bit 0 dan 1) serta menggunakan algoritma matematika yang rumit. Kekuatannya bertumpu pada **kerahasiaan kunci (key)**, bukan kerahasiaan algoritmanya (sesuai *Kerckhoffs's Principle*).`,
      orderIndex: 1,
    },
  });

  const modHashing = await prisma.module.create({
    data: {
      courseId: courseCrypto.id,
      title: 'Hashing & Integritas Data',
      orderIndex: 2,
    },
  });

  const lesHashingIntro = await prisma.lesson.create({
    data: {
      moduleId: modHashing.id,
      title: 'Apa itu Hashing?',
      content: `### Pengenalan Fungsi Hash

**Hash function** adalah algoritma matematika yang mengubah input data dengan panjang variabel menjadi output biner dengan panjang tetap (fixed-length). Hasil output ini disebut **hash value**, **message digest**, atau cukup **hash**.

#### Karakteristik Utama Fungsi Hash:
1. **Deterministic**: Input yang sama akan selalu menghasilkan output hash yang persis sama.
2. **One-Way (Pre-image Resistance)**: Sangat sulit (secara komputasi tidak mungkin) untuk mengembalikan hash value kembali menjadi input asli.
3. **Collision Resistance**: Sangat sulit menemukan dua input berbeda yang menghasilkan hash value yang sama.
4. **Avalanche Effect**: Perubahan kecil pada input (bahkan satu bit) akan mengubah hasil output hash secara drastis.

#### Fungsi Hash Populer:
- **MD5** (128-bit): Sudah tidak aman lagi untuk kebutuhan keamanan karena rentan terhadap collision attack.
- **SHA-256** (256-bit): Bagian dari keluarga SHA-2, standar industri saat ini untuk integritas berkas dan tanda tangan digital.`,
      orderIndex: 1,
    },
  });

  const lesHashingPassword = await prisma.lesson.create({
    data: {
      moduleId: modHashing.id,
      title: 'Hashing Password dengan Salt',
      content: `### Mengapa Menyimpan Password dengan Aman Sangat Penting?

Password tidak boleh disimpan dalam plaintext di database. Jika database bocor, penyerang dapat langsung melihat password pengguna. Solusinya adalah melakukan **hashing**.

#### Serangan terhadap Hashing Sederhana:
1. **Dictionary Attack**: Penyerang mencocokkan hash dengan kamus kata sandi populer yang sudah di-hash.
2. **Rainbow Table**: Tabel besar berisi ribuan pasang plaintext kata sandi dan nilai hash-nya untuk pencarian instan.

#### Solusi: Menambahkan Salt
**Salt** adalah data acak unik yang ditambahkan ke password sebelum proses hashing dijalankan.

\`\`\`text
Password + Salt -> Hash Function -> Secure Hash
\`\`\`

Dengan Salt, pengguna dengan password yang sama tetap memiliki nilai hash yang berbeda di database. Rainbow table menjadi tidak berguna karena penyerang harus membuat tabel baru untuk setiap salt unik.

#### Algoritma Hashing Modern untuk Password:
- **Bcrypt**: Menggunakan algoritma blowfish, dirancang lambat (memiliki cost factor) untuk menahan serangan brute-force.
- **Argon2**: Pemenang Password Hashing Competition (PHC), sangat tahan terhadap serangan berbasis GPU/ASIC hardware.`,
      orderIndex: 2,
    },
  });

  const modSymmetricAsymmetric = await prisma.module.create({
    data: {
      courseId: courseCrypto.id,
      title: 'Enkripsi Simetrik & Asimetrik',
      orderIndex: 3,
    },
  });

  const lesSymmetric = await prisma.lesson.create({
    data: {
      moduleId: modSymmetricAsymmetric.id,
      title: 'Symmetric Encryption (AES)',
      content: `### Enkripsi Kunci Simetris

**Symmetric Encryption** adalah metode enkripsi di mana pengirim dan penerima pesan menggunakan **kunci yang sama** untuk melakukan enkripsi dan dekripsi data.

#### Keuntungan:
- Proses komputasi sangat cepat.
- Cocok untuk mengenkripsi data berukuran besar (bulk encryption).

#### Kelemahan:
- **Key Distribution Problem**: Bagaimana cara membagikan kunci rahasia tersebut dengan aman ke penerima tanpa disadap oleh penyerang?

#### Standar Enkripsi Simetris Modern:
**Advanced Encryption Standard (AES)** adalah standar enkripsi simetris global saat ini. Memiliki ukuran kunci 128, 192, atau 256 bit. AES dianggap sangat aman dan digunakan di berbagai protokol seperti TLS, HTTPS, dan enkripsi disk penuh.`,
      orderIndex: 1,
    },
  });

  const lesAsymmetric = await prisma.lesson.create({
    data: {
      moduleId: modSymmetricAsymmetric.id,
      title: 'Asymmetric Encryption (RSA)',
      content: `### Enkripsi Kunci Asimetris (Public Key Cryptography)

Untuk menyelesaikan masalah distribusi kunci pada enkripsi simetrik, **Asymmetric Encryption** memperkenalkan konsep sepasang kunci:
1. **Public Key**: Kunci yang disebarkan secara bebas kepada siapapun. Digunakan untuk **mengenkripsi** pesan.
2. **Private Key**: Kunci rahasia yang disimpan rapat oleh pemiliknya. Digunakan untuk **mendekripsi** pesan.

#### Cara Kerja Singkat:
Jika Alice ingin mengirim pesan aman ke Bob:
1. Alice mengambil **Public Key Bob**.
2. Alice mengenkripsi pesan menggunakan Public Key Bob tersebut.
3. Pesan dikirimkan ke Bob. Hanya Bob yang dapat mendekripsinya menggunakan **Private Key Bob** yang dimilikinya.

#### Contoh Algoritma:
- **RSA**: Berdasarkan kesulitan faktorisasi dua bilangan prima besar.
- **ECC (Elliptic Curve Cryptography)**: Menawarkan keamanan setingkat RSA tetapi dengan ukuran kunci jauh lebih kecil, menghemat bandwidth dan komputasi.`,
      orderIndex: 2,
    },
  });

  // Course 3: Bug Bounty & Web Reconnaissance (INTERMEDIATE)
  const courseBugBounty = await prisma.course.create({
    data: {
      title: 'Bug Bounty & Web Reconnaissance',
      description: 'Pelajari dasar-dasar pencarian bug secara legal pada aplikasi web. Kurikulum ini memandu Anda melakukan tahapan rekognisi (recon) target, pemetaan teknologi, dan penyusunan laporan temuan yang valid.',
      level: 'INTERMEDIATE',
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const modRecon = await prisma.module.create({
    data: {
      courseId: courseBugBounty.id,
      title: 'Rekognisi & Pemetaan Target',
      orderIndex: 1,
    },
  });

  const lesRecon1 = await prisma.lesson.create({
    data: {
      moduleId: modRecon.id,
      title: 'Subdomain Discovery & OSINT',
      content: `### Dasar Tahapan Rekognisi (Recon)

Dalam dunia Bug Bounty, pepatah "Semakin banyak tahu target, semakin besar celah ditemukan" sangatlah benar. Rekognisi terbagi menjadi:
1. **Passive Recon**: Mengumpulkan data tanpa berinteraksi langsung dengan server target (menggunakan search engine, DNS record, OSINT).
2. **Active Recon**: Berinteraksi langsung dengan target (port scanning, directory bruteforcing).

#### Subdomain Enumeration
Subdomain sering kali menyimpan aplikasi internal yang terlupakan atau tidak terawat oleh admin perusahaan.
- **Tools**: Subfinder, Amass, Assetfinder.
- **OSINT Sources**: Certificate Transparency Logs (crt.sh), Shodan, Google Dorking.`,
      orderIndex: 1,
    },
  });

  const lesRecon2 = await prisma.lesson.create({
    data: {
      moduleId: modRecon.id,
      title: 'Port Scanning & Fingerprinting',
      content: `### Mengidentifikasi Service dan Port Terbuka

Setelah menemukan host aktif, langkah berikutnya adalah mencari tahu port apa saja yang terbuka dan layanan apa saja yang berjalan di atasnya.

#### Nmap (Network Mapper)
Nmap adalah standar industri untuk pemindaian jaringan.
- Memindai 1000 port populer: \`nmap <target_ip>\`
- Deteksi versi service (\`-sV\`) dan sistem operasi (\`-O\`): \`nmap -sV -O <target_ip>\`

#### Service Fingerprinting & Banner Grabbing
Banner grabbing adalah teknik membaca pesan sambutan (banner) dari port terbuka untuk mengetahui versi software secara spesifik. Informasi ini penting karena jika software tersebut menggunakan versi usang, kita dapat mencari Known Vulnerabilities (CVE) yang terkait.`,
      orderIndex: 2,
    },
  });

  const modReporting = await prisma.module.create({
    data: {
      courseId: courseBugBounty.id,
      title: 'Praktik Bug Bounty & Reporting',
      orderIndex: 2,
    },
  });

  const lesReporting1 = await prisma.lesson.create({
    data: {
      moduleId: modReporting.id,
      title: 'Menulis Laporan Bug Bounty Profesional',
      content: `### Mengapa Kualitas Laporan Sangat Menentukan?

Laporan temuan yang tidak jelas dapat berujung pada penolakan (Rejected) atau penutupan tanpa reward. Laporan yang baik membantu tim keamanan (triage) mereproduksi celah secara cepat.

#### Struktur Laporan Bug Bounty yang Baik:
1. **Title**: Ringkas dan deskriptif (contoh: "IDOR pada /api/v1/profile yang mengekspos data pribadi user").
2. **Description**: Penjelasan singkat mengenai letak kerentanan.
3. **Steps to Reproduce (PoC)**: Langkah-langkah detail bernomor dari awal hingga exploit berhasil dipicu.
4. **Impact**: Penjelasan dampak bisnis jika celah ini dieksploitasi oleh aktor jahat.
5. **Mitigation Recommendation**: Cara memperbaiki kode program agar aman.`,
      orderIndex: 1,
    },
  });

  const lesReporting2 = await prisma.lesson.create({
    data: {
      moduleId: modReporting.id,
      title: 'Klasifikasi Severity menggunakan CVSS v3.1',
      content: `### Mengenal Common Vulnerability Scoring System (CVSS)

CVSS adalah standar industri untuk menilai tingkat keparahan (severity) suatu kerentanan keamanan menggunakan skor dari 0.0 hingga 10.0.

#### Kategori Severity:
- **Low**: 0.1 - 3.9
- **Medium**: 4.0 - 6.9
- **High**: 7.0 - 8.9
- **Critical**: 9.0 - 10.0

#### Parameter Utama Penilaian:
- **Attack Vector (AV)**: Seberapa mudah akses penyerang (Network, Adjacent, Local, Physical).
- **Attack Complexity (AC)**: Kompleksitas serangan (Low, High).
- **Privileges Required (PR)**: Hak akses awal penyerang (None, Low, High).
- **User Interaction (UI)**: Apakah membutuhkan interaksi korban (None, Required).
- **C-I-A Impact**: Dampak terhadap Confidentiality, Integrity, dan Availability.`,
      orderIndex: 2,
    },
  });

  // Course 4: Linux & Reverse Engineering Basics (ADVANCED)
  const courseLinuxRev = await prisma.course.create({
    data: {
      title: 'Linux & Reverse Engineering Basics',
      description: 'Kurikulum mendalam bagi yang ingin melangkah ke ranah biner dan exploitasi sistem operasi. Pelajari dasar penguasaan command line Linux, hak akses file, struktur berkas ELF, serta analisis biner statis.',
      level: 'ADVANCED',
      isPublished: true,
      createdBy: admin.id,
    },
  });

  const modLinux = await prisma.module.create({
    data: {
      courseId: courseLinuxRev.id,
      title: 'Linux Command Line Basics',
      orderIndex: 1,
    },
  });

  const lesLinux1 = await prisma.lesson.create({
    data: {
      moduleId: modLinux.id,
      title: 'Navigasi File System & Permissions',
      content: `### Dasar Shell Linux

Linux adalah sistem operasi utama yang digunakan dalam infrastruktur server dan keamanan informasi. Pemahaman command line shell sangat krusial.

#### Navigasi Dasar:
- Menampilkan direktori saat ini: \`pwd\`
- Melihat isi direktori: \`ls -la\` (menampilkan berkas tersembunyi dan hak akses)
- Berpindah direktori: \`cd <nama_direktori>\`

#### File Permissions (Hak Akses)
Setiap file di Linux memiliki pemilik (user), grup (group), dan pihak lain (others). Hak akses direpresentasikan dalam mode:
- **Read (r)** = 4
- **Write (w)** = 2
- **Execute (x)** = 1

Contoh hak akses \`chmod 755 file.sh\`:
- Pemilik: 7 (rwx)
- Grup: 5 (r-x)
- Others: 5 (r-x)`,
      orderIndex: 1,
    },
  });

  const lesLinux2 = await prisma.lesson.create({
    data: {
      moduleId: modLinux.id,
      title: 'Piping & Grep untuk Analisis Log',
      content: `### Menggabungkan Perintah Linux

Di Linux, kita dapat mengalirkan keluaran (output) dari suatu perintah untuk menjadi masukan (input) perintah lainnya menggunakan simbol pipe (\`|\`).

#### Grep (Global Regular Expression Print)
Grep digunakan untuk menyaring string text berdasarkan pola tertentu.
- Mencari string 'failed' di berkas log: \`grep "failed" /var/log/auth.log\`

#### Contoh Kombinasi Piping & Grep:
\`\`\`bash
cat access.log | grep "POST /api" | wc -l
\`\`\`
Perintah di atas akan membaca berkas \`access.log\`, menyaring baris yang mengandung request \`POST /api\`, lalu menghitung jumlah barisnya (\`wc -l\`). Sangat berguna untuk mendeteksi indikasi percobaan eksploitasi.`,
      orderIndex: 2,
    },
  });

  const modRev = await prisma.module.create({
    data: {
      courseId: courseLinuxRev.id,
      title: 'Reverse Engineering Dasar',
      orderIndex: 2,
    },
  });

  const lesRev1 = await prisma.lesson.create({
    data: {
      moduleId: modRev.id,
      title: 'Memahami Struktur Biner ELF',
      content: `### Apa itu Reverse Engineering?

**Reverse Engineering (RE)** adalah proses menganalisis sistem atau biner untuk memahami cara kerjanya tanpa akses ke source code asli.

#### Format Berkas ELF (Executable and Linkable Format)
Di sistem operasi Linux, file executable biner dikemas dalam format **ELF**.
Struktur utama ELF meliputi:
- **ELF Header**: Berisi metadata utama seperti arsitektur (32-bit/64-bit), entry point address, dan OS ABI.
- **Program Header Table**: Menginstruksikan sistem operasi bagaimana membuat proses memory image (loading).
- **Section Header Table**: Berisi lokasi bagian-bagian kode seperti \`.text\` (kode instruksi assembly), \`.data\` (global variabel terinisialisasi), dan \`.rodata\` (read-only data seperti static string).`,
      orderIndex: 1,
    },
  });

  const lesRev2 = await prisma.lesson.create({
    data: {
      moduleId: modRev.id,
      title: 'Analisis Statis Biner',
      content: `### Teknik Analisis Statis Biner

Analisis statis adalah menganalisis program biner tanpa mengeksekusinya.

#### Alat Bantu CLI Terpopuler:
1. **file**: Mengidentifikasi arsitektur biner.
   \`\`\`bash
   file crackme
   \`\`\`
2. **strings**: Mencari strings ASCII tercetak dalam biner. Berguna untuk mencari hardcoded key, flag, atau API endpoint.
   \`\`\`bash
   strings crackme | grep "CTF"
   \`\`\`
3. **objdump**: Melakukan disassembly dari biner mesin kembali menjadi kode assembly bahasa rakitan.
   \`\`\`bash
   objdump -d crackme | less
   \`\`\`

#### Analisis Dinamis (Tambahan)
Mengeksekusi program di sandbox terisolasi sambil mengamati perilakunya menggunakan debugging tool seperti **GDB** (GNU Debugger) atau **strace** (System Call Trace).`,
      orderIndex: 2,
    },
  });

  // Course 1 additions: Module 3 and 4 for Web Security Basic
  const modXss = await prisma.module.create({
    data: {
      courseId: courseWeb.id,
      title: 'Cross-Site Scripting (XSS)',
      orderIndex: 3,
    },
  });

  const lesXssIntro = await prisma.lesson.create({
    data: {
      moduleId: modXss.id,
      title: 'Apa itu Cross-Site Scripting (XSS)?',
      content: `### Pemahaman Cross-Site Scripting (XSS)

**XSS** adalah kerentanan keamanan web di mana penyerang berhasil menyuntikkan (inject) script berbahaya (biasanya JavaScript) ke dalam halaman web yang sah, yang kemudian dieksekusi oleh browser korban.

#### Tiga Jenis Utama XSS:
1. **Stored XSS**: Script berbahaya disimpan secara permanen di database server (misal di komentar postingan) dan dimuat setiap kali user mengunjungi halaman tersebut.
2. **Reflected XSS**: Script berbahaya disuntikkan melalui parameter HTTP request (URL) dan langsung dipantulkan kembali di respon halaman tanpa disimpan.
3. **DOM-based XSS**: Kerentanan terjadi sepenuhnya di sisi klien (browser) di mana JavaScript lokal memproses input tidak aman dan memodifikasi struktur DOM halaman.

#### Dampak Eksploitasi:
- Pencurian cookie sesi (Session Hijacking).
- Redirect korban ke situs phishing.
- Manipulasi tampilan halaman web (Defacement).`,
      orderIndex: 1,
    },
  });

  const lesXssDefense = await prisma.lesson.create({
    data: {
      moduleId: modXss.id,
      title: 'Mencegah Kerentanan XSS',
      content: `### Cara Mengatasi Cross-Site Scripting

XSS dapat dicegah dengan menerapkan beberapa lapis pertahanan:

#### 1. Input Sanitization & Output Encoding
- **Sanitasi**: Membersihkan karakter berbahaya (seperti mengubah \`<\` menjadi \`&lt;\`, \`>\` menjadi \`&gt;\`).
- **Context-Aware Encoding**: Lakukan encoding data sesuai tempat data dirender (HTML body, Javascript variable, URL query).

#### 2. Content Security Policy (CSP)
CSP adalah HTTP header respon yang memberi tahu browser domain mana saja yang diizinkan untuk memuat dan mengeksekusi script.
Contoh:
\`\`\`http
Content-Security-Policy: default-src 'self'; script-src 'self' https://trustedscripts.com;
\`\`\`

#### 3. HttpOnly Cookies
Mencegah JavaScript mengakses token sesi sensitif menggunakan perintah \`document.cookie\`. Ini meminimalkan dampak jika XSS terjadi.`,
      orderIndex: 2,
    },
  });

  const modIdor = await prisma.module.create({
    data: {
      courseId: courseWeb.id,
      title: 'Insecure Direct Object Reference (IDOR)',
      orderIndex: 4,
    },
  });

  const lesIdorIntro = await prisma.lesson.create({
    data: {
      moduleId: modIdor.id,
      title: 'Konsep IDOR & Broken Access Control',
      content: `### Pengenalan IDOR

**IDOR** terjadi ketika aplikasi memberikan akses langsung ke objek database berdasarkan input pengguna, tanpa memverifikasi apakah pengguna tersebut memiliki otorisasi untuk mengakses objek tersebut.

#### Contoh Kerentanan:
Sebuah portal invoice memuat file invoice berdasarkan ID numerik:
\`\`\`text
https://target.com/invoice/view?id=4820
\`\`\`

Jika Alice mengubah parameter \`id\` menjadi \`4821\` (invoice milik Bob) dan aplikasi langsung menampilkannya tanpa mengecek kepemilikan, Alice berhasil mengeksploitasi celah IDOR!

#### Mengapa IDOR Terjadi?
Kerentanan ini disebabkan oleh kegagalan implementasi otorisasi di sisi backend server. Developer sering kali hanya mengandalkan kerahasiaan URL atau ID yang panjang, padahal parameter tersebut mudah ditebak atau dimanipulasi.`,
      orderIndex: 1,
    },
  });

  const lesIdorDefense = await prisma.lesson.create({
    data: {
      moduleId: modIdor.id,
      title: 'Mitigasi IDOR dan Broken Access Control',
      content: `### Langkah Pengamanan Akses Objek

Mitigasi IDOR berpusat pada pemeriksaan otorisasi yang ketat.

#### 1. Implementasikan Pemeriksaan Otorisasi berbasis User Session
Setiap kali ada request file atau objek, pastikan backend menanyakan: "Apakah user ID saat ini memiliki hak akses ke objek dengan ID ini?"

Contoh Node.js aman:
\`\`\`javascript
// AMAN: Validasi kepemilikan sebelum mengembalikan data
const invoice = await prisma.invoice.findFirst({
  where: {
    id: invoiceId,
    userId: session.userId // Membatasi pencarian hanya pada data user yang login
  }
});
if (!invoice) return res.status(404).json({ error: "Invoice tidak ditemukan." });
\`\`\`

#### 2. Gunakan Non-System/Random Identifiers (UUID)
Alih-alih ID increment bertipe integer (\`1, 2, 3, ...\`), gunakan UUID v4 yang panjang dan acak (\`e3b8a1c9-73fb-464a-bd54-d8bc28cfae8b\`). Ini mencegah penyerang melakukan brute-force atau menebak ID objek pengguna lain.`,
      orderIndex: 2,
    },
  });

  console.log('Created Courses, Modules, and Lessons.');

  // Create Challenges
  // Challenge 1: SQL Injection Login Bypass
  const flag1 = 'CTF{sqli_l0g1n_byp4ss_succ3ss}';
  const flagHash1 = await bcrypt.hash(flag1, 10);
  const challengeSqli = await prisma.challenge.create({
    data: {
      title: 'SQL Injection: Login Bypass',
      description: `### Deskripsi
Diberikan sebuah halaman login admin portal yang rentan terhadap SQL Injection. Halaman login tersebut mengeksekusi query database mentah secara langsung tanpa filter.

Tugas Anda adalah memanipulasi kolom input untuk melewati (bypass) otentikasi login dan masuk sebagai administrator tanpa mengetahui password yang asli.

### Target Lab
Gunakan tab "Interactive Lab" pada tantangan ini untuk berinteraksi dengan simulasi form login yang rentan.

Setelah berhasil masuk, sistem akan menampilkan Flag!`,
      category: 'WEB',
      difficulty: 'EASY',
      point: 100,
      flagHash: flagHash1,
      hint: 'Coba gunakan input payload klasik seperti admin\' OR \'1\'=\'1 -- pada kolom username untuk membuat query SQL selalu mengevaluasi ke TRUE.',
      solution: `1. Pergi ke tab Interactive Lab.
2. Di kolom Username, masukkan: admin' OR '1'='1
3. Biarkan password kosong.
4. Klik Login.
5. Salin flag yang muncul di console simulator.`,
      relatedLessonId: lesSqliDasar.id,
      createdBy: admin.id,
    },
  });

  // Challenge 2: Caesar Cipher Decoder
  const flag2 = 'CTF{c43s4r_c1ph3r_dec0d3d}';
  const flagHash2 = await bcrypt.hash(flag2, 10);
  const challengeCrypto = await prisma.challenge.create({
    data: {
      title: 'Caesar Cipher: Secret Scroll',
      description: `### Deskripsi
Kami menemukan pesan rahasia yang dienkripsi menggunakan metode Caesar Cipher kuno. Berdasarkan intelijen kami, penyerang menggeser alfabet maju sebanyak **3 posisi** (key = 3).

Deskripsikan pesan berikut untuk mendapatkan flag asli:
\`\`\`text
Fwi{f43s4r_c1ph3r_ghc0g3g}
\`\`\`

Format Flag: \`CTF{...}\``,
      category: 'CRYPTO',
      difficulty: 'EASY',
      point: 50,
      flagHash: flagHash2,
      hint: 'Karena pesan digeser maju sebanyak 3 langkah (key=3), Anda perlu menggeser kembali setiap huruf ke belakang sebanyak 3 langkah (A -> X, B -> Y, C -> Z, D -> A, dst). Huruf non-alfabet tetap sama.',
      solution: `Lakukan rotasi manual atau gunakan alat online (seperti CyberChef) dengan fungsi ROT13 atau Caesar Cipher (shift = -3).
Mengubah Fwi{f43s4r_c1ph3r_ghc0g3g} dengan pergeseran mundur 3 menjadi CTF{c43s4r_c1ph3r_dec0d3d}`,
      relatedLessonId: lesCryptoClassical.id,
      createdBy: admin.id,
    },
  });

  // Challenge 3: IDOR File Access
  const flag3 = 'CTF{id0r_f1l3_4cc3ss_n30n}';
  const flagHash3 = await bcrypt.hash(flag3, 10);
  const challengeIdor = await prisma.challenge.create({
    data: {
      title: 'Insecure Direct Object Reference (IDOR)',
      description: `### Deskripsi
Sebuah portal dokumen internal karyawan menggunakan parameter ID numerik pada URL untuk menampilkan berkas gaji:
\`\`\`text
/dashboard/documents?id=3
\`\`\`

Sebagai pengguna biasa (ID = 3), Anda hanya boleh melihat slip gaji Anda sendiri. Namun, periksa apakah Anda dapat mengakses slip gaji milik administrator (ID = 1) untuk mencuri flag penting mereka.

### Target Lab
Gunakan tab "Interactive Lab" pada tantangan ini untuk mensimulasikan manipulasi parameter ID URL.`,
      category: 'WEB',
      difficulty: 'MEDIUM',
      point: 150,
      flagHash: flagHash3,
      hint: 'Buka tab Interactive Lab, perhatikan input parameter ID di URL, lalu ubah nilainya menjadi 1.',
      solution: `1. Pergi ke tab Interactive Lab.
2. Di kolom URL input atau ID dokumen, ganti nilai parameter ID menjadi 1.
3. Klik "Fetch Document".
4. Dokumen admin akan ditampilkan lengkap dengan flagnya.`,
      relatedLessonId: lesIdorIntro.id,
      createdBy: admin.id,
    },
  });

  // Challenge 4: Cross-Site Scripting (XSS): Guestbook (WEB - MEDIUM)
  const flag4 = 'CTF{st0r3d_xss_g3stb00k_c00k13_st3al}';
  const flagHash4 = await bcrypt.hash(flag4, 10);
  const challengeXss = await prisma.challenge.create({
    data: {
      title: 'Cross-Site Scripting (XSS): Guestbook',
      description: `### Deskripsi
Diberikan sebuah halaman Guestbook (buku tamu) di mana pengunjung dapat meninggalkan komentar. Namun, kolom komentar ini tidak melakukan sanitasi input html/javascript.

Eksploitasi celah ini dengan menyuntikkan script JavaScript yang dapat membaca cookie administrator. Administrator memeriksa buku tamu ini secara berkala.

Flag berada di dalam nilai cookie session administrator yang dikirimkan.

Format Flag: \`CTF{...}\``,
      category: 'WEB',
      difficulty: 'MEDIUM',
      point: 150,
      flagHash: flagHash4,
      hint: 'Kirimkan payload Stored XSS klasik `<script>document.write(document.cookie)</script>` atau payload pencuri cookie untuk dijalankan di browser admin simulator.',
      solution: `Suntikkan payload javascript ke input komentar guestbook seperti: <script>alert(document.cookie)</script>, submit, lalu baca cookie yang dimuat oleh admin simulator.`,
      relatedLessonId: lesXssIntro.id,
      createdBy: admin.id,
    },
  });

  // Challenge 5: Reverse Engineering: ELF Crackme (REV - EASY)
  const flag5 = 'CTF{3lf_c4rckm3_5tr1ng_53arch}';
  const flagHash5 = await bcrypt.hash(flag5, 10);
  const challengeRev = await prisma.challenge.create({
    data: {
      title: 'Reverse Engineering: ELF Crackme',
      description: `### Deskripsi
Kami berhasil merebut biner executable Linux ELF berukuran kecil dari server musuh. Program ini meminta serial key input untuk memvalidasi akses, dan flag di-hardcode di dalam berkas biner tersebut.

Analisis berkas biner ini menggunakan pembedahan statis untuk mengekstrak string flag-nya.

Unduh berkas biner atau bayangkan Anda memiliki tools CLI Linux.

Format Flag: \`CTF{...}\``,
      category: 'REV',
      difficulty: 'EASY',
      point: 100,
      flagHash: flagHash5,
      hint: 'Gunakan utilitas CLI Linux `strings` pada berkas biner target untuk menampilkan seluruh karakter teks tercetak di dalamnya, lalu grep dengan pola "CTF".',
      solution: `Jalankan perintah: strings crackme | grep "CTF"`,
      relatedLessonId: lesRev2.id,
      createdBy: admin.id,
    },
  });

  // Challenge 6: Digital Forensics: Network Inspection (FORENSICS - EASY)
  const flag6 = 'CTF{pcap_4nalys1s_h77p_p4ssw0rd}';
  const flagHash6 = await bcrypt.hash(flag6, 10);
  const challengeForensic = await prisma.challenge.create({
    data: {
      title: 'Digital Forensics: Network Inspection',
      description: `### Deskripsi
Telah terjadi pembocoran data kredensial di jaringan internal perusahaan. Kami berhasil menangkap lalu lintas paket jaringan dalam format berkas \`capture.pcap\`.

Temukan parameter password / flag yang dikirimkan melalui protokol HTTP yang tidak terenkripsi (plaintext).

Format Flag: \`CTF{...}\``,
      category: 'FORENSICS',
      difficulty: 'EASY',
      point: 100,
      flagHash: flagHash6,
      hint: 'Filter lalu lintas HTTP di Wireshark menggunakan kata kunci `http.request.method == "POST"`, periksa isi baris data payload form HTTP POST.',
      solution: `Analisis file pcap menggunakan Wireshark, cari HTTP request bertipe POST, lalu periksa isi payload data parameters login.`,
      relatedLessonId: lesSymmetric.id,
      createdBy: admin.id,
    },
  });

  // Challenge 7: OSINT: Missing Agent (OSINT - EASY)
  const flag7 = 'CTF{0s1nt_g30l0c4t1on_found}';
  const flagHash7 = await bcrypt.hash(flag7, 10);
  const challengeOsint = await prisma.challenge.create({
    data: {
      title: 'OSINT: Missing Agent',
      description: `### Deskripsi
Seorang agen lapangan intelijen kami mengirimkan foto terakhirnya sebelum ia menghilang secara misterius. Foto tersebut diambil di sebuah kota pelabuhan.

Pecahkan informasi koordinat latitude dan longitude dari EXIF metadata gambar tersebut untuk mengetahui di kota mana ia berada.

Flag berupa nama kota pelabuhan tersebut (huruf kecil semua, contoh: \`CTF{jakarta}\` atau \`CTF{surabaya}\`).

Format Flag: \`CTF{nama_kota}\``,
      category: 'OSINT',
      difficulty: 'EASY',
      point: 50,
      flagHash: flagHash7,
      hint: 'Gunakan online tool metadata reader atau CLI `exiftool` untuk membaca metadata GPS latitude/longitude, lalu gunakan google maps reverse geocoding.',
      solution: `Baca EXIF data gambar, dapatkan titik GPS, masukkan ke Google Maps, cari kota pelabuhannya, dan format sebagai flag.`,
      relatedLessonId: lesRecon1.id,
      createdBy: admin.id,
    },
  });

  // Challenge 8: Cryptography: RSA Simple (CRYPTO - MEDIUM)
  const flag8 = 'CTF{rsa_pr1m3s_n_d_decrypt}';
  const flagHash8 = await bcrypt.hash(flag8, 10);
  const challengeCryptoRsa = await prisma.challenge.create({
    data: {
      title: 'Cryptography: RSA Simple',
      description: `### Deskripsi
Diberikan parameter kunci publik RSA berupa dua bilangan prima berikut:
- \`p = 61\`
- \`q = 53\`
- \`e = 17\`

Ciphertext pesan terenkripsi yang didapatkan adalah \`c = 2775\`.

Dekripsikan ciphertext tersebut untuk menemukan plaintext aslinya (berupa integer). Flag adalah plaintext integer tersebut yang diapit format flag.

Format Flag: \`CTF{plaintext_integer}\``,
      category: 'CRYPTO',
      difficulty: 'MEDIUM',
      point: 150,
      flagHash: flagHash8,
      hint: 'Hitung n = p * q, lalu hitung totient phi(n) = (p-1) * (q-1). Temukan eksponen dekripsi d dengan menghitung modular multiplicative inverse dari e modulo phi(n). Plaintext m = c^d mod n.',
      solution: `1. n = 61 * 53 = 3233.
2. phi(n) = 60 * 52 = 3120.
3. d = modInverse(17, 3120) = 2753.
4. Plaintext m = 2775^2753 mod 3233 = 65 (ASCII 'A').
5. Flag: CTF{rsa_pr1m3s_n_d_decrypt} (atau integer 65 jika dikonversi).`,
      relatedLessonId: lesAsymmetric.id,
      createdBy: admin.id,
    },
  });

  console.log('Created Challenges:', {
    c1: challengeSqli.title,
    c2: challengeCrypto.title,
    c3: challengeIdor.title,
    c4: challengeXss.title,
    c5: challengeRev.title,
    c6: challengeForensic.title,
    c7: challengeOsint.title,
    c8: challengeCryptoRsa.title,
  });

  // Create Bug Bounty Programs
  const bbProgramEcommerce = await prisma.bugBountyProgram.create({
    data: {
      title: 'E-Commerce Marketplace (CyberShop)',
      description: `### Deskripsi Program
CyberShop adalah platform e-commerce modern yang melayani pembelian barang-barang elektronik siber. Kami mengundang komunitas riset keamanan untuk menguji keamanan platform kami pada area profil pengguna, keranjang belanja, dan proses checkout.

### Target Lab
Simulator CyberShop tersedia di tab Lab Aplikasi di bawah. Cari celah di platform tersebut dan kirimkan laporan Anda.`,
      scope: `1. https://shop.cybershop.local/api/checkout (Checkout handler)
2. https://shop.cybershop.local/user/profile (User profile settings)
3. https://shop.cybershop.local/api/v1/coupon (Coupon application endpoint)`,
      outOfScope: `1. Uji beban (DDoS) dan brute force login.
2. Serangan rekayasa sosial (Phishing/Spam) terhadap staf CyberShop.
3. Kerentanan yang membutuhkan akses fisik ke perangkat fisik server.`,
      labUrl: '/labs/cybershop',
      rewardPoint: 350,
      createdBy: admin.id,
    },
  });

  const bbProgramBank = await prisma.bugBountyProgram.create({
    data: {
      title: 'CyberTrust Bank API Platform',
      description: `### Deskripsi Program
CyberTrust adalah bank digital yang menyediakan layanan transfer instan dan kelola dana investasi. Kami berfokus pada pengamanan otentikasi transaksi dan transaksi transfer saldo.

### Target Lab
Simulator API CyberTrust tersedia di tab Lab Aplikasi di bawah.`,
      scope: `1. https://api.cybertrust.local/v1/transfer (Fund transfer endpoint)
2. https://api.cybertrust.local/v1/auth/reset-password (Password reset flow)`,
      outOfScope: `1. Scanner kerentanan otomatis (seperti Acunetix, Nessus) tanpa validasi manual.
2. Masalah kegunaan UI (UI/UX bugs) atau tautan rusak.`,
      labUrl: '/labs/cybertrust',
      rewardPoint: 500,
      createdBy: admin.id,
    },
  });

  const bbProgramCloud = await prisma.bugBountyProgram.create({
    data: {
      title: 'Cloud Storage API (CyberDrive)',
      description: `### Deskripsi Program
CyberDrive adalah platform penyimpanan cloud berkas penting perusahaan. Kami mengundang peniliti keamanan untuk menguji API pengunduhan file eksternal dari bucket server sandbox kami.

### Target Lab
Simulator CyberDrive tersedia di tab Lab Aplikasi di bawah. Analisis input jalur file (file path) untuk mencari celah path traversal.`,
      scope: `1. https://api.cyberdrive.local/v1/files/download (File download handler)
2. https://api.cyberdrive.local/v1/bucket/policy (Bucket configuration policy)`,
      outOfScope: `1. Bruteforce ID invoice atau mengunggah malware massal.
2. Segala bentuk serangan social engineering.`,
      labUrl: '/labs/cyberdrive',
      rewardPoint: 450,
      createdBy: admin.id,
    },
  });

  console.log('Created Bug Bounty Programs:', {
    p1: bbProgramEcommerce.title,
    p2: bbProgramBank.title,
    p3: bbProgramCloud.title,
  });

  // Create some initial submissions & progress for demonstration
  // 1. User solved Caesar Cipher
  await prisma.challengeSubmission.create({
    data: {
      userId: user.id,
      challengeId: challengeCrypto.id,
      submittedFlag: flag2,
      status: 'CORRECT',
      pointEarned: 50,
    },
  });

  // Create Point Transaction for user
  await prisma.pointTransaction.create({
    data: {
      userId: user.id,
      sourceType: 'CHALLENGE',
      sourceId: challengeCrypto.id,
      point: 50,
      description: `Menyelesaikan Challenge CTF: ${challengeCrypto.title}`,
    },
  });

  // User earned First Blood badge
  await prisma.userBadge.create({
    data: {
      userId: user.id,
      badgeId: badgeFirstBlood.id,
    },
  });

  // User progress on Course 1: completed Lesson 1
  await prisma.courseProgress.create({
    data: {
      userId: user.id,
      lessonId: lesWebIntro1.id,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // 2. BugHunter solved Caesar Cipher and IDOR
  await prisma.challengeSubmission.create({
    data: {
      userId: bugHunter.id,
      challengeId: challengeCrypto.id,
      submittedFlag: flag2,
      status: 'CORRECT',
      pointEarned: 50,
    },
  });
  await prisma.challengeSubmission.create({
    data: {
      userId: bugHunter.id,
      challengeId: challengeIdor.id,
      submittedFlag: flag3,
      status: 'CORRECT',
      pointEarned: 150,
    },
  });

  await prisma.pointTransaction.create({
    data: {
      userId: bugHunter.id,
      sourceType: 'CHALLENGE',
      sourceId: challengeCrypto.id,
      point: 50,
      description: `Menyelesaikan Challenge CTF: ${challengeCrypto.title}`,
    },
  });
  await prisma.pointTransaction.create({
    data: {
      userId: bugHunter.id,
      sourceType: 'CHALLENGE',
      sourceId: challengeIdor.id,
      point: 150,
      description: `Menyelesaikan Challenge CTF: ${challengeIdor.title}`,
    },
  });

  await prisma.userBadge.create({
    data: {
      userId: bugHunter.id,
      badgeId: badgeFirstBlood.id,
    },
  });

  // Create a Bug Report from BugHunter (approved/valid)
  const report1 = await prisma.bugReport.create({
    data: {
      userId: bugHunter.id,
      programId: bbProgramEcommerce.id,
      title: 'Kupon Diskon Bernilai Negatif Mengakibatkan Penambahan Uang',
      vulnerabilityType: 'BAC',
      severity: 'HIGH',
      stepsToReproduce: `1. Masuk ke halaman keranjang CyberShop.
2. Tambahkan produk seharga Rp 100.000.
3. Di kolom kupon, kirim permintaan POST ke /api/v1/coupon dengan payload coupon_code: "CUSTOM-DISC" dan ubah request menggunakan proxy untuk mengirimkan value diskon negatif: -150000.
4. Periksa total pembayaran, tagihan berubah menjadi -Rp 50.000 dan setelah checkout, saldo wallet bertambah Rp 50.000.`,
      impact: 'Penyerang dapat menambah saldo wallet mereka secara gratis dengan melakukan checkout barang bernilai negatif.',
      evidence: 'Mengirimkan payload coupon {"code": "MYCOUPON", "discount": -150000} mengembalikan respon sukses dengan total checkout negatif.',
      evidenceUrl: 'https://imgbb.local/vulnerable_coupon.png',
      status: 'VALID',
      reviewedBy: admin.id,
      pointAwarded: 50,
    },
  });

  await prisma.pointTransaction.create({
    data: {
      userId: bugHunter.id,
      sourceType: 'BUG_REPORT',
      sourceId: report1.id,
      point: 50,
      description: `Laporan Bug Bounty disetujui: ${report1.title}`,
    },
  });

  await prisma.userBadge.create({
    data: {
      userId: bugHunter.id,
      badgeId: badgeBugHunter.id,
    },
  });

  // Create a pending Bug Report from user
  await prisma.bugReport.create({
    data: {
      userId: user.id,
      programId: bbProgramEcommerce.id,
      title: 'SQL Injection pada Pencarian Profil',
      vulnerabilityType: 'SQLI',
      severity: 'CRITICAL',
      stepsToReproduce: `1. Buka halaman https://shop.cybershop.local/user/profile
2. Pada kolom pencarian nama teman, masukkan payload: test' UNION SELECT username, password_hash FROM users --
3. Database mengembalikan seluruh username dan hash password pengguna di halaman profil.`,
      impact: 'Kebocoran data sensitif seluruh data akun kredensial pengguna.',
      evidence: 'Melampirkan tangkapan layar tabel users yang muncul di bawah input pencarian.',
      evidenceUrl: 'https://imgbb.local/sqli_evidence.png',
      status: 'PENDING',
    },
  });

  // Create a pending Generated Draft
  await prisma.generatedChallengeDraft.create({
    data: {
      generatedBy: user.id,
      promptInput: 'SQL Injection basic challenge for absolute beginners focusing on bypass log in',
      category: 'WEB',
      difficulty: 'EASY',
      generatedTitle: 'Auth Bypass via SQLi',
      generatedDescription: 'Sebuah panel login admin dikembangkan tanpa sanitasi SQL. Masuklah sebagai admin dan temukan flag rahasianya!',
      generatedHint: "Coba gunakan single quote (') untuk memicu error SQL, lalu buat kondisi OR agar selalu TRUE.",
      generatedSolution: "Input ' OR 1=1 -- pada input username dan password apa saja.",
      generatedFlagHash: await bcrypt.hash('CTF{sqli_auth_bypass_generated}', 10),
      generatedPoint: 80,
      status: 'PENDING',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
