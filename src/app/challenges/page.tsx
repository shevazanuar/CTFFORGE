'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Target, Sparkles, Trophy, Award, CheckCircle2, HelpCircle, Lock, Unlock, Eye, Sparkle, AlertTriangle } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  point: number;
  hint: string | null;
  solved: boolean;
  solution: string | null;
}

interface DraftDraft {
  id: string;
  generatedTitle: string;
  category: string;
  difficulty: string;
  status: string;
  promptInput: string;
}

function ChallengesContent() {
  const { user, refetchUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams?.get('tab') || 'challenges';
  const defaultChallengeId = searchParams?.get('id') || null;

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  
  // Submission
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ text: string; success: boolean } | null>(null);
  
  // Hint unlock state
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  // Copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Generator form state
  const [prompt, setPrompt] = useState('');
  const [genCategory, setGenCategory] = useState('WEB');
  const [genDifficulty, setGenDifficulty] = useState('EASY');
  const [generating, setGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any | null>(null);
  const [userDrafts, setUserDrafts] = useState<DraftDraft[]>([]);

  // Interactive Lab state
  const [sqliUsername, setSqliUsername] = useState('');
  const [sqliPassword, setSqliPassword] = useState('');
  const [sqliResult, setSqliResult] = useState<{ success: boolean; flag?: string; msg: string } | null>(null);

  const [idorId, setIdorId] = useState('3');
  const [idorResult, setIdorResult] = useState<{ success: boolean; flag?: string; content: string } | null>(null);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/challenges');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges);
        
        // If query param ID was provided, pre-select it
        if (defaultChallengeId) {
          const matched = data.challenges.find((c: Challenge) => c.id === defaultChallengeId);
          if (matched) setSelectedChallenge(matched);
        }
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  };

  const fetchDrafts = async () => {
    try {
      const res = await fetch('/api/generate');
      if (res.ok) {
        const data = await res.json();
        setUserDrafts(data.drafts || []);
      }
    } catch (err) {
      console.error('Error fetching drafts:', err);
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchDrafts();
  }, [defaultChallengeId]);

  const handleSelectChallenge = (ch: Challenge) => {
    setSelectedChallenge(ch);
    setFlagInput('');
    setSubmitMessage(null);
    setHintUnlocked(false);
    setSolutionUnlocked(false);
    
    // Reset lab states
    setSqliUsername('');
    setSqliPassword('');
    setSqliResult(null);
    setIdorId('3');
    setIdorResult(null);
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallenge || !flagInput.trim()) return;
    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch(`/api/challenges/${selectedChallenge.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flag: flagInput.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.status === 'CORRECT') {
          setSubmitMessage({ text: data.message, success: true });
          
          // Re-fetch challenges to update solved status
          await fetchChallenges();
          
          // Re-fetch selected challenge to update solved status in preview pane
          setSelectedChallenge(prev => prev ? { ...prev, solved: true } : null);

          // Update user points in navigation bar
          await refetchUser();

          if (data.badgeAwarded) {
            alert(`🏆 SELAMAT! Anda memperoleh lencana baru: "${data.badgeAwarded.name}" - ${data.badgeAwarded.description}`);
          }
        } else {
          setSubmitMessage({ text: data.message, success: false });
        }
      } else {
        setSubmitMessage({ text: data.error || 'Terjadi kesalahan.', success: false });
      }
    } catch (err) {
      setSubmitMessage({ text: 'Gagal menghubungi server.', success: false });
    } finally {
      setSubmitting(false);
    }
  };

  // Challenge Authoring Draft request
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true);
    setGeneratedDraft(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category: genCategory, difficulty: genDifficulty }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDraft(data.draft);
        fetchDrafts(); // Refetch listing
        setPrompt('');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal generate draft.');
      }
    } catch (err) {
      console.error('Error generating challenge:', err);
    } finally {
      setGenerating(false);
    }
  };

  // Mini Labs Logic
  const runSqliLab = (e: React.FormEvent) => {
    e.preventDefault();
    const userLower = sqliUsername.toLowerCase();
    
    // SQL Injection detection: checking if user puts ' or comment tags
    const containsSqli = userLower.includes("'") && (userLower.includes('or') || userLower.includes('--') || userLower.includes('#'));
    
    if (containsSqli || userLower === 'admin') {
      setSqliResult({
        success: true,
        flag: 'CTF{sqli_l0g1n_byp4ss_succ3ss}',
        msg: 'SQL Query executed: SELECT * FROM admin_users WHERE username = \'admin\' OR \'1\'=\'1\' AND password = \'\'. Login BERHASIL sebagai admin!',
      });
    } else {
      setSqliResult({
        success: false,
        msg: `SQL Query executed: SELECT * FROM admin_users WHERE username = '${sqliUsername}' AND password = '${sqliPassword}'. Login GAGAL. Username/password tidak cocok atau tidak ditemukan.`,
      });
    }
  };

  const runIdorLab = () => {
    const idNum = parseInt(idorId);
    
    if (idNum === 1) {
      setIdorResult({
        success: true,
        flag: 'CTF{id0r_f1l3_4cc3ss_n30n}',
        content: 'SLIP GAJI ADMINISTRATOR UTAMA (CONFIDENTIAL). Nama: Administrator, Jabatan: Chief Security Officer, Gaji Bersih: Rp 75.000.000, Catatan Khusus: Gunakan flag ini untuk mensubmit tantangan.',
      });
    } else if (idNum === 3) {
      setIdorResult({
        success: false,
        content: 'SLIP GAJI AGEN-3. Nama: Cyber Cadet, Jabatan: Security Analyst Intern, Gaji Bersih: Rp 5.000.000, Catatan Khusus: Tidak ada berkas rahasia di slip gaji Anda.',
      });
    } else {
      setIdorResult({
        success: false,
        content: `Error 404: Dokumen ID ${idorId} tidak ditemukan atau Anda tidak memiliki otorisasi untuk melihatnya. (ID slip gaji yang valid adalah 1 dan 3).`,
      });
    }
  };

  const filteredChallenges = challenges.filter(ch => 
    categoryFilter === 'ALL' ? true : ch.category === categoryFilter
  );

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1 flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-900 mb-8 font-mono text-sm gap-2">
          <button
            onClick={() => { setActiveTab('challenges'); router.push('/challenges?tab=challenges'); }}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'challenges'
                ? 'border-cyber-green text-cyber-green glow-green'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            CTF Challenges
          </button>
          <button
            onClick={() => { setActiveTab('generator'); router.push('/challenges?tab=generator'); }}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'generator'
                ? 'border-cyber-purple text-cyber-purple glow-purple'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Challenge Generator (Forge)
          </button>
        </div>

        {/* Tab 1: CTF CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            
            {/* LEFT COLUMN: Filter & Challenge List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                {['ALL', 'WEB', 'CRYPTO', 'FORENSICS', 'OSINT', 'MISC'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-purple-500/20 text-cyber-green border border-purple-500/40 font-bold'
                        : 'bg-zinc-950 text-gray-500 border border-zinc-900 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Challenge List Box */}
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[65vh] overflow-y-auto space-y-2">
                {filteredChallenges.length > 0 ? (
                  filteredChallenges.map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => handleSelectChallenge(ch)}
                      className={`w-full text-left p-3.5 rounded-lg border font-mono transition-all flex justify-between items-center ${
                        selectedChallenge?.id === ch.id
                          ? 'bg-purple-500/10 text-cyber-green border-purple-500/35 glow-green'
                          : 'bg-zinc-950/30 text-gray-400 hover:text-white border-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs truncate max-w-[200px] sm:max-w-xs">{ch.title}</div>
                        <div className="flex gap-2 items-center mt-1 text-[9px] text-gray-500">
                          <span className="text-purple-400 uppercase">{ch.category}</span>
                          <span>•</span>
                          <span className={`font-bold ${
                            ch.difficulty === 'EASY' ? 'text-cyber-green' : ch.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-cyber-red'
                          }`}>
                            {ch.difficulty}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs font-bold text-cyber-green">{ch.point} pts</span>
                        {ch.solved && <CheckCircle2 className="h-4 w-4 text-cyber-green" />}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-gray-500">
                    Tidak ada tantangan dalam kategori ini.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Selected Challenge Detail & Interactive Labs (7 cols) */}
            <div className="lg:col-span-7">
              {selectedChallenge ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-6">
                  
                  {/* Title & Solve Status */}
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                    <div>
                      <h2 className="font-mono text-lg font-bold text-white">{selectedChallenge.title}</h2>
                      <div className="flex gap-2 items-center text-[10px] font-mono mt-1 text-gray-400">
                        <span className="uppercase text-purple-400">{selectedChallenge.category}</span>
                        <span>•</span>
                        <span className={`font-bold ${
                          selectedChallenge.difficulty === 'EASY' ? 'text-cyber-green' : selectedChallenge.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-cyber-red'
                        }`}>
                          {selectedChallenge.difficulty}
                        </span>
                        <span>•</span>
                        <span>Skor: {selectedChallenge.point} pts</span>
                      </div>
                    </div>
                    {selectedChallenge.solved && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-cyber-green font-bold bg-cyber-green/10 px-2 py-1 rounded border border-cyber-green/20">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        SOLVED
                      </span>
                    )}
                  </div>

                  {/* Description Markdown Renderer */}
                  <div className="prose prose-invert max-w-none text-xs font-mono leading-relaxed text-gray-300">
                    {/* Custom inline code parser for challenge description */}
                    {selectedChallenge.description.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) return <h3 key={idx} className="text-sm font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      if (line.startsWith('```')) return null;
                      if (line.startsWith('Fwi{')) return <pre key={idx} className="bg-zinc-950 p-2.5 rounded border border-zinc-900 my-2 text-cyber-purple">{line}</pre>;
                      const cleanLine = line
                        .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/`([^`]+)`/g, '<code class="bg-zinc-950 px-1.5 py-0.5 rounded text-cyber-green text-[10px] border border-zinc-900">$1</code>');
                      return <p key={idx} className="my-1.5" dangerouslySetInnerHTML={{ __html: cleanLine }} />;
                    })}
                  </div>

                  {/* INTERACTIVE PLAYGROUND LAB BOX */}
                  {(selectedChallenge.title === 'SQL Injection: Login Bypass' || selectedChallenge.title === 'Insecure Direct Object Reference (IDOR)') && (
                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4">
                      <div className="flex items-center gap-1.5 text-cyber-green font-mono text-[10px] font-bold tracking-wider uppercase border-b border-zinc-900 pb-2">
                        <Target className="h-3.5 w-3.5 animate-pulse" />
                        Interactive Lab Simulator
                      </div>

                      {/* SQL Injection Lab form */}
                      {selectedChallenge.title === 'SQL Injection: Login Bypass' && (
                        <form onSubmit={runSqliLab} className="space-y-3 font-mono text-xs">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-gray-500 block mb-1">Username</label>
                              <input
                                type="text"
                                value={sqliUsername}
                                onChange={(e) => setSqliUsername(e.target.value)}
                                placeholder="admin' OR '1'='1"
                                className="w-full bg-cyber-bg border border-zinc-800 rounded p-2 text-white focus:border-cyber-green/40 ring-glow-green"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-gray-500 block mb-1">Password</label>
                              <input
                                type="text"
                                value={sqliPassword}
                                onChange={(e) => setSqliPassword(e.target.value)}
                                placeholder="apapun"
                                className="w-full bg-cyber-bg border border-zinc-800 rounded p-2 text-white focus:border-cyber-green/40 ring-glow-green"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-[10px] cursor-pointer"
                          >
                            Kirim Payload Login
                          </button>

                          {sqliResult && (
                            <div className={`p-3 rounded border font-mono text-[10px] mt-3 ${
                              sqliResult.success
                                ? 'bg-cyber-green/10 border-cyber-green/20 text-cyber-green'
                                : 'bg-cyber-red/10 border-cyber-red/20 text-cyber-red'
                            }`}>
                              <p className="leading-relaxed">{sqliResult.msg}</p>
                              {sqliResult.success && sqliResult.flag && (
                                <div className="mt-2 p-2 bg-zinc-950 rounded border border-cyber-green/40 font-bold select-all flex justify-between items-center">
                                  <span>FLAG: {sqliResult.flag}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(sqliResult.flag || '')}
                                    className="text-[8px] text-cyber-green hover:text-white bg-cyber-green/10 hover:bg-cyber-green/20 px-2 py-1 rounded border border-cyber-green/30 uppercase cursor-pointer transition-all"
                                  >
                                    {copiedText === sqliResult.flag ? 'Tersalin!' : 'Salin Flag'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </form>
                      )}

                      {/* IDOR Lab form */}
                      {selectedChallenge.title === 'Insecure Direct Object Reference (IDOR)' && (
                        <div className="space-y-3 font-mono text-xs">
                          <div className="flex gap-2 items-center">
                            <span className="text-gray-500 font-bold">GET</span>
                            <span className="bg-zinc-900 px-2 py-1 rounded text-gray-400">/api/invoice/download?id=</span>
                            <input
                              type="number"
                              value={idorId}
                              onChange={(e) => setIdorId(e.target.value)}
                              className="bg-cyber-bg border border-zinc-800 rounded p-1.5 w-16 text-white text-center focus:border-cyber-green/40 ring-glow-green"
                              min={0}
                              required
                            />
                            <button
                              onClick={runIdorLab}
                              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all text-[10px] cursor-pointer"
                            >
                              Kirim Permintaan
                            </button>
                          </div>

                          {idorResult && (
                            <div className="p-3 bg-zinc-950 rounded border border-zinc-900 text-[10px] space-y-2 leading-relaxed">
                              <p className={idorResult.success ? 'text-cyber-green' : 'text-gray-400'}>
                                {idorResult.content}
                              </p>
                              {idorResult.success && idorResult.flag && (
                                <div className="mt-2 p-2 bg-zinc-950 rounded border border-cyber-green/40 font-bold select-all flex justify-between items-center text-cyber-green">
                                  <span>FLAG: {idorResult.flag}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(idorResult.flag || '')}
                                    className="text-[8px] text-cyber-green hover:text-white bg-cyber-green/10 hover:bg-cyber-green/20 px-2 py-1 rounded border border-cyber-green/30 uppercase cursor-pointer transition-all"
                                  >
                                    {copiedText === idorResult.flag ? 'Tersalin!' : 'Salin Flag'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submission Form */}
                  <form onSubmit={handleFlagSubmit} className="space-y-3 font-mono text-xs">
                    <label className="text-gray-400 uppercase tracking-wider block">Submit Flag</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={flagInput}
                        onChange={(e) => setFlagInput(e.target.value)}
                        placeholder="CTF{flag_format_disini}"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-cyber-green/50 text-white placeholder-gray-700 transition-all text-xs ring-glow-green"
                        required
                        disabled={submitting || selectedChallenge.solved}
                      />
                      <button
                        type="submit"
                        className="px-6 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all border border-purple-500/40 hover:border-cyber-green/50 disabled:bg-zinc-900 disabled:text-gray-600 disabled:border-transparent cursor-pointer"
                        disabled={submitting || selectedChallenge.solved}
                      >
                        {submitting ? 'Verifying...' : 'Submit'}
                      </button>
                    </div>

                    {submitMessage && (
                      <div className={`p-3 rounded-lg border font-bold ${
                        submitMessage.success
                          ? 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green'
                          : 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red'
                      }`}>
                        {submitMessage.text}
                      </div>
                    )}
                  </form>

                  {/* Hints & Solutions panel */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900 text-xs font-mono">
                    {/* Hint unlock */}
                    <div>
                      {hintUnlocked ? (
                        <div className="p-3 rounded bg-zinc-950/60 border border-zinc-900 text-gray-400 leading-normal">
                          <span className="text-amber-500 font-bold block mb-1">Clue / Hint:</span>
                          {selectedChallenge.hint || 'Tidak ada petunjuk untuk tantangan ini.'}
                        </div>
                      ) : (
                        <button
                          onClick={() => setHintUnlocked(true)}
                          className="w-full text-left flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-gray-500 hover:text-white transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="h-4 w-4 text-amber-500" />
                            Buka Hint (Gratis)
                          </span>
                          <Unlock className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Solution unlock (if solved or admin) */}
                    <div>
                      {selectedChallenge.solution || selectedChallenge.solved || user?.role === 'ADMIN' ? (
                        solutionUnlocked || selectedChallenge.solved || user?.role === 'ADMIN' ? (
                          <div className="p-3 rounded bg-zinc-950/60 border border-zinc-900 text-gray-400 leading-normal max-h-40 overflow-y-auto">
                            <span className="text-cyber-green font-bold block mb-1">Writeup / Pembahasan:</span>
                            {selectedChallenge.solution || 'Belum ada pembahasan yang dimasukkan.'}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSolutionUnlocked(true)}
                            className="w-full text-left flex items-center justify-between p-3 rounded bg-zinc-950 border border-zinc-900 text-gray-500 hover:text-white transition-all cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Eye className="h-4 w-4 text-cyber-green" />
                              Lihat Pembahasan
                            </span>
                            <Unlock className="h-3.5 w-3.5" />
                          </button>
                        )
                      ) : (
                        <div className="flex items-center gap-2 p-3 rounded bg-zinc-950 border border-zinc-900 text-zinc-700 select-none">
                          <Lock className="h-4 w-4" />
                          <span>Selesaikan soal untuk membuka Pembahasan</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-16">
                  Pilih tantangan di bilah kiri untuk melihat detail soal, playground lab, dan mensubmit bendera flag.
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: CHALLENGE GENERATOR */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            
            {/* LEFT FORM COLUMN (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="cyber-panel p-6 rounded-2xl border border-purple-500/20 space-y-4">
                <h3 className="font-mono text-sm font-bold text-white flex items-center gap-1.5 border-b border-zinc-900 pb-2.5">
                  <Sparkle className="h-4 w-4 text-cyber-purple animate-pulse" />
                  Forge Challenge Assistant
                </h3>
                <p className="text-xs text-gray-400 font-mono leading-relaxed">
                  Gunakan template-driven AI Generator kami untuk merancang draf soal latihan baru secara instan.
                  Draf yang digenerate akan disimpan ke antrean review Admin sebelum dipublikasikan secara live.
                </p>

                <form onSubmit={handleGenerate} className="space-y-4 font-mono text-xs">
                  {/* Category select */}
                  <div className="space-y-1">
                    <label className="text-gray-500 block">Kategori</label>
                    <select
                      value={genCategory}
                      onChange={(e) => setGenCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-purple/40"
                    >
                      <option value="WEB">WEB EXPLOITATION</option>
                      <option value="CRYPTO">CRYPTOGRAPHY</option>
                      <option value="FORENSICS">FORENSICS</option>
                      <option value="OSINT">OSINT (OPEN SOURCE INTEL)</option>
                      <option value="MISC">MISCELLANEOUS</option>
                    </select>
                  </div>

                  {/* Difficulty select */}
                  <div className="space-y-1">
                    <label className="text-gray-500 block">Tingkat Kesulitan</label>
                    <select
                      value={genDifficulty}
                      onChange={(e) => setGenDifficulty(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-purple/40"
                    >
                      <option value="EASY">EASY (50 Pts)</option>
                      <option value="MEDIUM">MEDIUM (150 Pts)</option>
                      <option value="HARD">HARD (300 Pts)</option>
                    </select>
                  </div>

                  {/* Prompt Textarea */}
                  <div className="space-y-1">
                    <label className="text-gray-500 block">Instruksi / Prompt Pembuatan</label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Contoh: 'SQL Injection auth bypass basic' atau 'Caesar Cipher shift 5 klasik'"
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-purple/40 focus:ring-glow-purple transition-all resize-none"
                      required
                      disabled={generating}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-cyber-purple text-white font-bold transition-all border border-purple-500/40 hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer glow-purple"
                    disabled={generating}
                  >
                    {generating ? 'Generating Draft...' : 'Generate Challenge Draft'}
                  </button>
                </form>
              </div>

              {/* User drafts history list */}
              <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                <h3 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
                  Antrean Draf Anda ({userDrafts.length})
                </h3>
                
                <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-[10px]">
                  {userDrafts.length > 0 ? (
                    userDrafts.map((d) => (
                      <div
                        key={d.id}
                        className="p-2.5 rounded bg-zinc-950 border border-zinc-900 flex justify-between items-center"
                      >
                        <div>
                          <div className="text-white font-bold">{d.generatedTitle}</div>
                          <div className="text-gray-500 mt-0.5">Prompt: &quot;{d.promptInput}&quot;</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] ${
                          d.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse' :
                          d.status === 'APPROVED' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' :
                          'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">Belum ada draf diajukan.</div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT GENERATOR OUTPUT PREVIEW COLUMN (7 cols) */}
            <div className="lg:col-span-7">
              {generatedDraft ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/30 space-y-6">
                  
                  {/* Header output warning */}
                  <div className="p-3 bg-cyber-green/10 border border-cyber-green/30 text-cyber-green rounded-lg font-mono text-xs flex gap-2.5 items-start">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <span className="font-bold">Draf Berhasil Dibuat & Dikirim!</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Permintaan draf tantangan Anda telah didaftarkan ke antrean review Admin. Salin data di bawah jika diperlukan.</p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono text-xs">
                    {/* Title & Stats */}
                    <div className="border-b border-zinc-900 pb-3">
                      <div className="text-gray-500 text-[10px]">JUDUL SOAL</div>
                      <div className="text-sm font-bold text-white mt-0.5">{generatedDraft.generatedTitle}</div>
                      <div className="flex gap-2 mt-1 text-[9px]">
                        <span className="text-purple-400 uppercase">{generatedDraft.category}</span>
                        <span>•</span>
                        <span className="text-cyber-green">{generatedDraft.difficulty}</span>
                        <span>•</span>
                        <span>{generatedDraft.generatedPoint} Poin</span>
                      </div>
                    </div>

                    {/* Flag text */}
                    <div className="p-3 rounded bg-zinc-950 border border-cyber-green/30 text-cyber-green flex justify-between items-center">
                      <div>
                        <div className="text-[10px] text-gray-500 font-bold mb-1">BENDERA FLAG (PLAIN TEXT - HANYA DITAMPILKAN SEKALI)</div>
                        <span className="text-sm font-bold select-all">{generatedDraft.plainFlag}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(generatedDraft.plainFlag)}
                        className="text-[8px] text-cyber-green hover:text-white bg-cyber-green/10 hover:bg-cyber-green/20 px-2 py-1 rounded border border-cyber-green/30 uppercase cursor-pointer transition-all"
                      >
                        {copiedText === generatedDraft.plainFlag ? 'Tersalin!' : 'Salin Flag'}
                      </button>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-gray-500 text-[10px] mb-1">DESKRIPSI TANTANGAN</div>
                      <div className="p-3 rounded bg-zinc-950 border border-zinc-900 text-gray-400 max-h-36 overflow-y-auto leading-relaxed">
                        {generatedDraft.generatedDescription.split('\n').map((line: string, i: number) => (
                          <p key={i} className="my-1">{line}</p>
                        ))}
                      </div>
                    </div>

                    {/* Hint */}
                    <div>
                      <div className="text-gray-500 text-[10px] mb-1">CLUE / HINT</div>
                      <div className="p-3 rounded bg-zinc-950 border border-zinc-900 text-gray-400">
                        {generatedDraft.generatedHint}
                      </div>
                    </div>

                    {/* Solution */}
                    <div>
                      <div className="text-gray-500 text-[10px] mb-1">WRITEUP / SOLUSI</div>
                      <div className="p-3 rounded bg-zinc-950 border border-zinc-900 text-gray-400 leading-normal">
                        {generatedDraft.generatedSolution}
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-16">
                  Buat draf tantangan baru di panel formulir sebelah kiri untuk melihat hasil generate draf secara detail.
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default function ChallengesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyber-blue"></div>
        </div>
      </div>
    }>
      <ChallengesContent />
    </Suspense>
  );
}
