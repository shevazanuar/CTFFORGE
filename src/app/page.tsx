import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Shield, BookOpen, Target, FileText, Sparkles, Trophy, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const pillars = [
    {
      title: 'Structured Courses',
      desc: 'Pelajari konsep kerentanan web dan kriptografi secara berurutan lewat modul materi terstruktur.',
      icon: BookOpen,
      color: 'text-cyber-blue',
      borderColor: 'border-cyber-blue/20',
      bgColor: 'bg-cyber-blue/5',
    },
    {
      title: 'CTF Challenge Practice',
      desc: 'Praktikkan ilmu dengan menyelesaikan tantangan bendera rahasia pada simulator lab interaktif.',
      icon: Target,
      color: 'text-cyber-green',
      borderColor: 'border-cyber-green/20',
      bgColor: 'bg-cyber-green/5',
    },
    {
      title: 'Bug Bounty Simulator',
      desc: 'Pahami dunia nyata industri audit keamanan web dengan membuat laporan temuan celah terstruktur.',
      icon: FileText,
      color: 'text-cyber-red',
      borderColor: 'border-cyber-red/20',
      bgColor: 'bg-cyber-red/5',
    },
    {
      title: 'Challenge Authoring (Forge)',
      desc: 'Buat draf latihan soal baru secara instan berbasis topik menggunakan asisten pembuat tantangan.',
      icon: Sparkles,
      color: 'text-cyber-purple',
      borderColor: 'border-cyber-purple/20',
      bgColor: 'bg-cyber-purple/5',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 flex flex-col items-center justify-center text-center relative">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl -z-10"></div>
        <div className="absolute top-1/3 left-1/3 w-60 h-60 rounded-full bg-cyber-green/5 blur-3xl -z-10"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-xs font-mono text-purple-400 mb-6 tracking-wide animate-pulse">
          <Sparkles className="h-3 w-3 text-cyber-green glow-green" />
          <span>Next-Generation Cybersecurity Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-mono font-bold tracking-tight text-white mb-6 max-w-4xl leading-tight">
          Tempa Keahlian Siber Anda di{' '}
          <span className="text-cyber-green glow-green block sm:inline">CTFForge</span>
        </h1>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Platform terpadu untuk belajar dasar keamanan web, mempraktikkan tantangan Capture The Flag,
          mensimulasikan penulisan laporan Bug Bounty, serta berkontribusi melatih orang lain.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center font-mono">
          <Link
            href="/register"
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-base font-semibold transition-all border border-purple-500/40 hover:border-cyber-green/50 shadow-lg shadow-purple-500/15"
          >
            Mulai Belajar Sekarang
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-gray-300 border border-zinc-800 hover:border-purple-500/30 transition-all text-base font-semibold backdrop-blur"
          >
            Masuk Akun
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-24">
          {pillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className={`cyber-panel p-6 rounded-xl text-left border ${p.borderColor}`}
              >
                <div className={`p-3 rounded-lg ${p.bgColor} inline-block mb-4`}>
                  <Icon className={`h-6 w-6 ${p.color}`} />
                </div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-20 w-full p-8 rounded-2xl bg-zinc-950/80 border border-zinc-900 flex flex-col md:flex-row justify-around items-center gap-6 backdrop-blur">
          <div className="text-center">
            <div className="text-3xl font-mono font-extrabold text-cyber-green glow-green">100%</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Interactive Labs</div>
          </div>
          <div className="h-px w-12 md:h-8 md:w-px bg-zinc-800"></div>
          <div className="text-center">
            <div className="text-3xl font-mono font-extrabold text-cyber-blue glow-blue">15+</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Learning Lessons</div>
          </div>
          <div className="h-px w-12 md:h-8 md:w-px bg-zinc-800"></div>
          <div className="text-center">
            <div className="text-3xl font-mono font-extrabold text-cyber-purple glow-purple">EASY - HARD</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">CTF Difficulty</div>
          </div>
          <div className="h-px w-12 md:h-8 md:w-px bg-zinc-800"></div>
          <div className="text-center">
            <div className="text-3xl font-mono font-extrabold text-cyber-red glow-red">USD / Point</div>
            <div className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1">Bug Bounty Simulation</div>
          </div>
        </div>

        {/* Workflow Showcase */}
        <div className="mt-24 max-w-4xl text-left">
          <h2 className="text-2xl font-mono font-bold text-white text-center mb-10">Alur Belajar & Praktik Terpadu</h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex gap-4 items-start p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">1</span>
              <div>
                <h4 className="text-white font-bold mb-1">Membaca Teori di Learning Path</h4>
                <p className="text-gray-400">Pahami konsep celah keamanan seperti SQL Injection atau Caesar Cipher dasar melalui panduan teks interaktif.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-cyber-green/10 border border-cyber-green/30 text-cyber-green text-xs font-bold">2</span>
              <div>
                <h4 className="text-white font-bold mb-1">Mengerjakan CTF Hands-on Lab</h4>
                <p className="text-gray-400">Gunakan playground simulator mini di halaman soal untuk melakukan eksploitasi dan mendapatkan flag rahasia.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-4 rounded-lg bg-zinc-950/40 border border-zinc-900">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-cyber-red/10 border border-cyber-red/30 text-cyber-red text-xs font-bold">3</span>
              <div>
                <h4 className="text-white font-bold mb-1">Menulis Laporan Bug Bounty</h4>
                <p className="text-gray-400">Simulasikan pelaporan temuan celah keamanan dengan mengisi formulir terstruktur (langkah reproduksi, severity, dampak) untuk direview Admin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8 bg-zinc-950/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-gray-500">
          <div>&copy; 2026 CTFForge Platform. All rights reserved.</div>
          <div className="flex gap-4">
            <span className="text-cyber-green">Secure code, secure system.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
