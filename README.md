# CTFForge 🛡️

**CTFForge** adalah sebuah platform pembelajaran keamanan siber (cybersecurity learning) fullstack terintegrasi. Platform ini menggabungkan jalur pembelajaran terstruktur (*Structured Learning Paths*), latihan praktis CTF (*Capture The Flag*) dengan lab interaktif terintegrasi, simulasi pemburuan celah keamanan (*Bug Bounty Simulator*), asisten pembuat tantangan dinamis (*Challenge Draft Generator*), dan konsol pengawasan administratif (*Admin Console & Audit Trail Logs*).

Aplikasi ini dibangun menggunakan framework **Next.js (App Router)**, **Prisma ORM**, database **SQLite** (zero-setup untuk pengujian lokal), dan didekorasi dengan gaya visual **Cyberpunk Neon/Glassmorphism** menggunakan **Tailwind CSS v4**.

---

## 🚀 Fitur Utama & Arsitektur Solusi

1. **Structured Learning Paths**: Modul belajar keamanan siber dari tingkat pemula hingga mahir dengan pelacakan kemajuan (*progress tracking*) per materi.
2. **Interactive CTF Challenges**: Latihan praktis Capture The Flag dengan tab simulator interaktif di dalam halaman soal (contoh: Lab SQL Injection Login Bypass).
3. **Bug Bounty Simulation**: Workspace audit keamanan aplikasi sandbox (contoh: toko online *CyberShop* & layanan keuangan *CyberTrust*) lengkap dengan formulir pelaporan celah terstandar.
4. **Challenge Draft Generator**: Memungkinkan pengguna membuat rancangan soal CTF secara otomatis menggunakan generator prompt terstruktur, yang kemudian di-review oleh admin sebelum dipublikasikan live.
5. **Admin Console & Audit Trail**: Dasbor moderasi admin untuk memeriksa kiriman laporan bug, menyetujui draf soal generator, mengelola course/challenges, serta meninjau catatan log audit administrator secara transparan.

---

## 🔒 Mekanisme Pertahanan & Keamanan Kode (Secure Coding)

* **Validasi Skema Masukan**: Validasi Zod digunakan untuk memastikan struktur, tipe data, panjang input, dan enum request sesuai aturan sebelum diproses oleh API.
* **Pencegahan SQL Injection**: Diperkuat melalui penggunaan Prisma ORM dan penghindaran raw query tidak aman, sehingga database SQLite terproteksi dari bypass otentikasi.
* **Mitigasi XSS**: Risiko XSS dikurangi melalui output escaping bawaan React, validasi input, dan rencana penerapan security headers/CSP.
* **Security Headers**: HTTP Response Headers dikonfigurasi pada `next.config.ts` untuk mengaktifkan `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, serta kebijakan Referrer & Permissions.
* **Rate Limiting**: Throttling masukan di-enforce menggunakan algoritma *token-bucket* in-memory untuk membatasi pengiriman formulir pada rute API kritis (Login, Registrasi, Submisi Flag, Pembuatan Soal, dan Laporan Bug).

---

## 🛠️ Panduan Instalasi & Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan CTFForge di lingkungan lokal Anda:

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18+) dan **npm** di komputer Anda.

### 2. Instal Dependensi
Jalankan perintah berikut pada terminal di direktori utama proyek:
```bash
npm install
```

### 3. Setup Lingkungan (.env)
Buat file bernama `.env` di direktori root (atau salin dari `.env.example`) dan isi variabel berikut:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="ganti-dengan-kunci-rahasia-jwt-yang-panjang-dan-aman-disini-1337"
```
> **Catatan Keamanan**: Kunci rahasia JWT wajib diisi dan diubah agar aplikasi tidak *fail-fast* saat dijalankan.

### 4. Push Database & Seed Data
Buat database SQLite lokal `dev.db` dan jalankan pembenihan data awal (*database seeding*):
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Jalankan Server Pengembangan
Jalankan perintah berikut untuk menyalakan server lokal:
```bash
npm run dev
```
Buka browser dan kunjungi: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Kredensial Akun Uji Coba (Test Accounts)

Gunakan akun berikut untuk menguji masing-masing peran pengguna di platform:

| Peran Akun | Email | Password | Deskripsi Akses |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ctfforge.com` | `admin123` | Konsol admin, review bug reports, publish draf generator, audit logs. |
| **Cyber Cadet** | `user@ctfforge.com` | `user123` | Akses materi course, latihan CTF, sandbox bug bounty, generator soal. |
| **Bug Hunter** | `pemburu@ctfforge.com` | `pemburu123` | Akun siap pakai dengan reputasi awal 250 poin dan badge khusus. |

---

## 🎮 Panduan Walkthrough Eksploitasi (Interactive Labs)

### 1. Lab SQL Injection (Login Bypass)
* **Lokasi**: Menu **CTF Practice** ➔ Soal **SQL Injection: Login Bypass** (atau via materi pelajaran SQL Injection Dasar di **Learning Path**).
* **Vulnerability**: Form login tidak melakukan sanitasi input dan merangkai query SQL secara langsung.
* **Langkah Eksploitasi**:
  1. Klik tab **Interactive Lab** pada halaman tantangan.
  2. Pada input *Username*, masukkan payload bypass SQL klasik:
     ```sql
     ' OR '1'='1
     ```
  3. Kosongkan atau isi input *Password* secara bebas.
  4. Klik **Login**.
  5. Simulator lab akan memproses bypass query dan mencetak kunci flag:
     `CTF{sqli_l0g1n_byp4ss_succ3ss}`
  6. Salin flag tersebut dan submit pada form verifikasi jawaban untuk mendapatkan poin.

### 2. Lab Bug Bounty - CyberShop (Negative Coupon Vulnerability)
* **Lokasi**: Menu **Bug Bounty** ➔ Program **E-Commerce Marketplace (CyberShop)**.
* **Vulnerability**: Logic kupon diskon tidak memvalidasi nilai akhir checkout, memungkinkan nilai kupon diskon melebihi harga produk sehingga menghasilkan total transaksi negatif yang justru menambahkan saldo pengguna saat pembelian diselesaikan.
* **Langkah Eksploitasi**:
  1. Klik **Jalankan Simulator Lab Aplikasi**.
  2. Buka simulator belanja CyberShop dan masukkan item ke dalam keranjang.
  3. Masukkan kode kupon diskon custom berikut:
     ```text
     CUSTOM-DISC
     ```
  4. Klik **Terapkan Kupon**. Perhatikan total belanjaan Anda menjadi negatif (misal: `-Rp150.000`).
  5. Selesaikan checkout transaksi belanja. Saldo Anda akan bertambah secara instan.
  6. Salin kode bukti celah (*evidence key*) yang muncul:
     `EVIDENCE-CYBERSHOP-BAC-NEG-COUPON`
  7. Klik **Buat & Kirim Laporan Temuan Celah Baru** untuk melaporkannya kepada Administrator dan mendapatkan imbalan poin reputasi.

---

## 📊 Diagram Desain Database & Aliran Data

### Entity Relationship Diagram (ERD)

```mermaid
erDiagram
  USERS {
    uuid id PK
    varchar name
    varchar email UK
    text password_hash
    enum role
    int total_point
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  COURSES {
    uuid id PK
    varchar title
    text description
    enum level
    boolean is_published
    uuid created_by FK
  }

  MODULES {
    uuid id PK
    uuid course_id FK
    varchar title
    int order_index
  }

  LESSONS {
    uuid id PK
    uuid module_id FK
    varchar title
    text content
    text video_url
    int order_index
  }

  COURSE_PROGRESS {
    uuid id PK
    uuid user_id FK
    uuid lesson_id FK
    boolean is_completed
    timestamptz completed_at
  }

  CHALLENGES {
    uuid id PK
    varchar title
    text description
    enum category
    enum difficulty
    int point
    text flag_hash
    text hint
    text solution
    uuid related_lesson_id FK
    uuid created_by FK
  }

  CHALLENGE_SUBMISSIONS {
    uuid id PK
    uuid user_id FK
    uuid challenge_id FK
    text submitted_flag
    enum status
    int point_earned
    timestamptz submitted_at
  }

  BUG_BOUNTY_PROGRAMS {
    uuid id PK
    varchar title
    text description
    text scope
    text out_of_scope
    text lab_url
    int reward_point
    boolean is_active
    uuid created_by FK
  }

  BUG_REPORTS {
    uuid id PK
    uuid user_id FK
    uuid program_id FK
    varchar title
    enum vulnerability_type
    enum severity
    text steps_to_reproduce
    text impact
    text evidence
    text evidence_url
    enum status
    uuid reviewed_by FK
    int point_awarded
  }

  GENERATED_CHALLENGE_DRAFTS {
    uuid id PK
    uuid generated_by FK
    text prompt_input
    enum category
    enum difficulty
    varchar generated_title
    text generated_description
    text generated_hint
    text generated_solution
    text generated_flag_hash
    int generated_point
    enum status
    uuid reviewed_by FK
    uuid published_challenge_id FK
  }

  BADGES {
    uuid id PK
    varchar name UK
    text description
    text icon_url
    text condition
  }

  USER_BADGES {
    uuid id PK
    uuid user_id FK
    uuid badge_id FK
    timestamptz earned_at
  }

  POINT_TRANSACTIONS {
    uuid id PK
    uuid user_id FK
    enum source_type
    uuid source_id
    int point
    text description
  }

  ADMIN_LOGS {
    uuid id PK
    uuid admin_id FK
    varchar action
    varchar target_type
    varchar target_id
    text description
    timestamptz created_at
  }

  USERS ||--o{ COURSES : creates
  USERS ||--o{ CHALLENGES : creates
  USERS ||--o{ BUG_BOUNTY_PROGRAMS : creates
  USERS ||--o{ GENERATED_CHALLENGE_DRAFTS : generates
  USERS ||--o{ COURSE_PROGRESS : has
  USERS ||--o{ CHALLENGE_SUBMISSIONS : submits
  USERS ||--o{ BUG_REPORTS : writes
  USERS ||--o{ USER_BADGES : earns
  USERS ||--o{ POINT_TRANSACTIONS : receives
  USERS ||--o{ ADMIN_LOGS : records
  COURSES ||--o{ MODULES : contains
  MODULES ||--o{ LESSONS : contains
  LESSONS ||--o{ COURSE_PROGRESS : tracked_by
  LESSONS ||--o{ CHALLENGES : related_to
  CHALLENGES ||--o{ CHALLENGE_SUBMISSIONS : receives
  BUG_BOUNTY_PROGRAMS ||--o{ BUG_REPORTS : receives
  BADGES ||--o{ USER_BADGES : assigned
  GENERATED_CHALLENGE_DRAFTS }o--o| CHALLENGES : publishes_to
```

### Data Flow Diagram (DFD) Level 0

```mermaid
flowchart LR
  U[User<br/>Peserta latihan]
  S((CTFForge<br/>Learning Platform))
  A[Admin / Reviewer<br/>Pengelola platform]

  U -- "registrasi/login<br/>submit flag/report<br/>prompt generate" --> S
  S -- "token/session<br/>materi, challenge, scope<br/>point, progress, badge" --> U

  A -- "CRUD konten<br/>review report<br/>approve draft" --> S
  S -- "statistik platform<br/>data submission<br/>daftar report & draft" --> A
```

### Data Flow Diagram (DFD) Level 1

```mermaid
flowchart LR
  U[User]
  A[Admin / Reviewer]

  P1((P1<br/>Authentication))
  P2((P2<br/>Manajemen Course))
  P3((P3<br/>CTF Challenge))
  P4((P4<br/>Bug Bounty Simulator))
  P5((P5<br/>Generate Challenge))
  P6((P6<br/>Leaderboard & Badge))

  D1[(D1 Users)]
  D2[(D2 Course Content<br/>courses, modules, lessons)]
  D3[(D3 Course Progress)]
  D4[(D4 Challenges)]
  D5[(D5 Challenge Submissions)]
  D6[(D6 Bug Bounty Programs)]
  D7[(D7 Bug Reports)]
  D8[(D8 Generated Drafts)]
  D9[(D9 Badges & User Badges)]
  D10[(D10 Point Transactions)]
  D11[(D11 Admin Logs)]

  U -- kredensial --> P1
  P1 -- token/session --> U
  P1 -- validasi/simpan user --> D1
  D1 -- data user --> P1

  U -- akses materi / selesai lesson --> P2
  P2 -- materi & progress --> U
  A -- CRUD course/module/lesson --> P2
  P2 -- simpan/baca konten --> D2
  P2 -- simpan progress --> D3

  U -- submit flag --> P3
  P3 -- hasil validasi & poin --> U
  A -- CRUD challenge --> P3
  P3 -- baca challenge + flag_hash --> D4
  P3 -- simpan submission --> D5
  P3 -- poin jika correct --> D10

  U -- submit bug report --> P4
  P4 -- status report & poin --> U
  A -- CRUD program / review report --> P4
  P4 -- baca scope --> D6
  P4 -- simpan/update report --> D7
  P4 -- poin jika valid --> D10
  P4 -- log admin action --> D11

  U -- prompt generate --> P5
  P5 -- status draft --> U
  A -- approve/reject draft --> P5
  P5 -- simpan draft --> D8
  P5 -- publish jadi challenge --> D4
  P5 -- log admin action --> D11

  D1 -- total_point --> P6
  D5 -- solve history --> P6
  D7 -- valid report --> P6
  D10 -- riwayat poin --> P6
  P6 -- award badge --> D9
  D9 -- data badge --> P6
  P6 -- ranking, badge, statistik --> U
  P6 -- statistik platform --> A
```
