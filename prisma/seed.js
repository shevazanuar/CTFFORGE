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
      relatedLessonId: null,
      createdBy: admin.id,
    },
  });

  console.log('Created Challenges:', { c1: challengeSqli.title, c2: challengeCrypto.title, c3: challengeIdor.title });

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

  console.log('Created Bug Bounty Programs:', { p1: bbProgramEcommerce.title, p2: bbProgramBank.title });

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
