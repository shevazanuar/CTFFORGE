'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Cpu, FileText, Sparkles, BookOpen, Target, Users, Check, X, ShieldAlert, ChevronRight, Award, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
}

interface Course {
  id: string;
  title: string;
  level: string;
}

interface Challenge {
  id: string;
  title: string;
  category: string;
  point: number;
}

interface BugReport {
  id: string;
  title: string;
  severity: string;
  status: string;
  stepsToReproduce: string;
  impact: string;
  evidence: string;
  program: { title: string };
  user: { name: string; email: string };
}

interface Draft {
  id: string;
  generatedTitle: string;
  category: string;
  difficulty: string;
  generatedPoint: number;
  promptInput: string;
  generatedDescription: string;
  generatedHint: string;
  generatedSolution: string;
  status: string;
  creator: { name: string };
}

interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  description: string;
  createdAt: string;
  admin: { name: string; email: string };
}

export default function AdminPage() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'reports' | 'drafts' | 'courses' | 'challenges' | 'logs'>('reports');
  const [loading, setLoading] = useState(true);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    usersCount: 0,
    challengesCount: 0,
    pendingReports: 0,
    pendingDrafts: 0,
  });

  // DB items lists
  const [pendingReports, setPendingReports] = useState<BugReport[]>([]);
  const [pendingDrafts, setPendingDrafts] = useState<Draft[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  // Selection for review
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Review actions fields
  const [reportReviewStatus, setReportReviewStatus] = useState('VALID');
  const [reportReviewPoints, setReportReviewPoints] = useState('100');
  const [reviewing, setReviewing] = useState(false);

  // CRUD Course form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('BEGINNER');

  // CRUD Challenge form
  const [newChTitle, setNewChTitle] = useState('');
  const [newChDesc, setNewChDesc] = useState('');
  const [newChCat, setNewChCat] = useState('WEB');
  const [newChDiff, setNewChDiff] = useState('EASY');
  const [newChPoint, setNewChPoint] = useState('100');
  const [newChFlag, setNewChFlag] = useState('');
  const [newChHint, setNewChHint] = useState('');
  const [newChSol, setNewChSol] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch users count & general stats (we can calculate from list endpoints)
      const reportsRes = await fetch('/api/bug-bounty/reports');
      const draftsRes = await fetch('/api/generate');
      const coursesRes = await fetch('/api/courses');
      const chRes = await fetch('/api/challenges');
      const lbRes = await fetch('/api/leaderboard');
      const logsRes = await fetch('/api/admin/logs');

      if (reportsRes.ok && draftsRes.ok && coursesRes.ok && chRes.ok && lbRes.ok) {
        const reportsData = await reportsRes.json();
        const draftsData = await draftsRes.json();
        const coursesData = await coursesRes.json();
        const chData = await chRes.json();
        const lbData = await lbRes.json();

        const pReports = reportsData.reports.filter((r: any) => r.status === 'PENDING');
        const pDrafts = draftsData.drafts.filter((d: any) => d.status === 'PENDING');

        setPendingReports(pReports);
        setPendingDrafts(pDrafts);
        setCourses(coursesData.courses);
        setChallenges(chData.challenges);

        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setAdminLogs(logsData.logs);
        }

        setStats({
          usersCount: lbData.leaderboard.length,
          challengesCount: chData.challenges.length,
          pendingReports: pReports.length,
          pendingDrafts: pDrafts.length,
        });
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  // Review Bug Report
  const handleReviewReport = async (status: string) => {
    if (!selectedReport) return;
    setReviewing(true);

    try {
      const res = await fetch(`/api/bug-bounty/reports/${selectedReport.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          pointAwarded: status === 'VALID' ? parseInt(reportReviewPoints) : 0,
        }),
      });

      if (res.ok) {
        alert(`Bug report review submitted successfully with status: ${status}`);
        setSelectedReport(null);
        fetchAdminData();
      } else {
        alert('Gagal mensubmit review.');
      }
    } catch (err) {
      console.error('Error reviewing report:', err);
    } finally {
      setReviewing(false);
    }
  };

  // Review Generator Draft (Publish / Reject)
  const handleReviewDraft = async (status: string) => {
    if (!selectedDraft) return;
    setReviewing(true);

    try {
      const res = await fetch(`/api/generate/${selectedDraft.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        alert(`Draft has been ${status === 'APPROVED' ? 'APPROVED & PUBLISHED live' : 'REJECTED'}.`);
        setSelectedDraft(null);
        fetchAdminData();
      } else {
        alert('Gagal mensubmit review draft.');
      }
    } catch (err) {
      console.error('Error reviewing draft:', err);
    } finally {
      setReviewing(false);
    }
  };

  // Create Course
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          description: newCourseDesc,
          level: newCourseLevel,
          isPublished: true,
        }),
      });

      if (res.ok) {
        alert('Course baru berhasil ditambahkan!');
        setNewCourseTitle('');
        setNewCourseDesc('');
        fetchAdminData();
      } else {
        alert('Gagal membuat course.');
      }
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  // Create Challenge
  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChTitle,
          description: newChDesc,
          category: newChCat,
          difficulty: newChDiff,
          point: parseInt(newChPoint),
          flag: newChFlag,
          hint: newChHint,
          solution: newChSol,
        }),
      });

      if (res.ok) {
        alert('Tantangan CTF baru berhasil ditambahkan!');
        setNewChTitle('');
        setNewChDesc('');
        setNewChFlag('');
        setNewChHint('');
        setNewChSol('');
        fetchAdminData();
      } else {
        alert('Gagal membuat tantangan.');
      }
    } catch (err) {
      console.error('Error creating challenge:', err);
    }
  };

  if (user?.role !== 'ADMIN') return null;

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-cyber-red glow-red flex items-center gap-2">
            <Cpu className="h-7 w-7" />
            Admin Control Center
          </h1>
          <p className="text-sm text-gray-400 mt-1.5 font-mono">
            Pusat operasional utama pengelola platform untuk memoderasi laporan bug, menyetujui draf generator, dan CRUD konten.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8 font-mono">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 flex items-center gap-3">
            <Users className="h-5 w-5 text-cyber-blue" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Total User</div>
              <div className="text-lg font-bold text-white">{stats.usersCount}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 flex items-center gap-3">
            <Target className="h-5 w-5 text-cyber-green" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Live CTF</div>
              <div className="text-lg font-bold text-white">{stats.challengesCount}</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 flex items-center gap-3">
            <FileText className="h-5 w-5 text-cyber-red" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Review Bug</div>
              <div className="text-lg font-bold text-cyber-red glow-red">{stats.pendingReports} pending</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-900 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-cyber-purple" />
            <div>
              <div className="text-[10px] text-gray-500 uppercase">Draf Forge</div>
              <div className="text-lg font-bold text-cyber-purple glow-purple">{stats.pendingDrafts} pending</div>
            </div>
          </div>
        </div>

        {/* Admin Navigation tabs */}
        <div className="flex border-b border-zinc-900 mb-8 font-mono text-sm gap-2">
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports' ? 'border-cyber-red text-cyber-red glow-red' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Review Bug Reports ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'drafts' ? 'border-cyber-purple text-cyber-purple glow-purple' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Approve Drafts ({pendingDrafts.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'courses' ? 'border-cyber-blue text-cyber-blue glow-blue' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Manage Courses
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'challenges' ? 'border-cyber-green text-cyber-green glow-green' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            Manage Challenges
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'logs' ? 'border-amber-500 text-amber-500 glow-amber' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            Audit Logs ({adminLogs.length})
          </button>
        </div>

        {/* Tab 1: REVIEW BUG REPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2">
                {pendingReports.length > 0 ? (
                  pendingReports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => { setSelectedReport(r); setSelectedDraft(null); }}
                      className={`w-full text-left p-3.5 rounded-lg border font-mono transition-all flex justify-between items-center ${
                        selectedReport?.id === r.id
                          ? 'bg-purple-500/10 text-cyber-red border-purple-500/35 glow-red'
                          : 'bg-zinc-950/30 text-gray-400 hover:text-white border-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{r.title}</div>
                        <div className="text-[9px] text-gray-500 mt-1 uppercase">Pengirim: {r.user.name} ({r.severity})</div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-500">Tidak ada laporan bug pending.</div>
                )}
              </div>
            </div>

            {/* Review Box */}
            <div className="lg:col-span-7">
              {selectedReport ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-6">
                  <h3 className="font-mono text-sm font-bold text-white border-b border-zinc-900 pb-3">
                    Moderasi Laporan Bug: {selectedReport.title}
                  </h3>

                  <div className="space-y-4 font-mono text-xs text-gray-300">
                    <p><strong>Program Target:</strong> {selectedReport.program.title}</p>
                    <p><strong>Pengirim:</strong> {selectedReport.user.name} ({selectedReport.user.email})</p>
                    <p><strong>Severity:</strong> <span className="text-cyber-red font-bold">{selectedReport.severity}</span></p>
                    <div>
                      <strong>Langkah Reproduksi:</strong>
                      <pre className="p-3 bg-zinc-950 rounded border border-zinc-900 text-gray-400 text-[10px] mt-1 whitespace-pre-wrap">{selectedReport.stepsToReproduce}</pre>
                    </div>
                    <div>
                      <strong>Bukti Code (Evidence):</strong>
                      <div className="p-2.5 bg-zinc-950 rounded border border-cyber-red/20 text-cyber-purple font-bold mt-1">{selectedReport.evidence}</div>
                    </div>

                    {/* Review Forms */}
                    <div className="border-t border-zinc-900 pt-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-500 block mb-1">Status Verifikasi</label>
                          <select
                            value={reportReviewStatus}
                            onChange={(e) => setReportReviewStatus(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-red/40"
                          >
                            <option value="VALID">VALID (Setujui & Beri Poin)</option>
                            <option value="DUPLICATE">DUPLICATE</option>
                            <option value="INFORMATIVE">INFORMATIVE</option>
                            <option value="REJECTED">REJECTED / NOT APPLICABLE</option>
                          </select>
                        </div>
                        {reportReviewStatus === 'VALID' && (
                          <div>
                            <label className="text-gray-500 block mb-1">Poin Reward Diberikan</label>
                            <input
                              type="number"
                              value={reportReviewPoints}
                              onChange={(e) => setReportReviewPoints(e.target.value)}
                              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-red/40"
                              min={0}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 font-mono text-xs">
                        <button
                          onClick={() => handleReviewReport(reportReviewStatus)}
                          disabled={reviewing}
                          className="flex-1 py-2.5 rounded bg-cyber-green text-cyber-bg font-bold hover:bg-cyber-green-dim transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check className="h-4 w-4" /> Submit Keputusan
                        </button>
                        {reportReviewStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleReviewReport('REJECTED')}
                            disabled={reviewing}
                            className="px-6 py-2.5 rounded bg-cyber-red text-white font-bold hover:bg-rose-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <X className="h-4 w-4" /> Tolak Laporan
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-12">
                  Pilih laporan bug pending di sebelah kiri untuk me-review langkah eksploitasi dan memberikan poin.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: APPROVE GENERATOR DRAFTS */}
        {activeTab === 'drafts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2">
                {pendingDrafts.length > 0 ? (
                  pendingDrafts.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => { setSelectedDraft(d); setSelectedReport(null); }}
                      className={`w-full text-left p-3.5 rounded-lg border font-mono transition-all flex justify-between items-center ${
                        selectedDraft?.id === d.id
                          ? 'bg-purple-500/10 text-cyber-purple border-purple-500/35 glow-purple'
                          : 'bg-zinc-950/30 text-gray-400 hover:text-white border-zinc-900/60'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{d.generatedTitle}</div>
                        <div className="text-[9px] text-gray-500 mt-1 uppercase">Topik: {d.category} ({d.difficulty})</div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-500">Tidak ada draf pending menunggu moderasi.</div>
                )}
              </div>
            </div>

            {/* Review Box */}
            <div className="lg:col-span-7">
              {selectedDraft ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-6">
                  <h3 className="font-mono text-sm font-bold text-white border-b border-zinc-900 pb-3">
                    Moderasi Draf Challenge: {selectedDraft.generatedTitle}
                  </h3>

                  <div className="space-y-4 font-mono text-xs text-gray-300">
                    <p><strong>Digenerate Oleh:</strong> {selectedDraft.creator.name}</p>
                    <p><strong>Prompt Input User:</strong> "{selectedDraft.promptInput}"</p>
                    <p><strong>Difficulty & Poin:</strong> {selectedDraft.difficulty} ({selectedDraft.generatedPoint} Pts)</p>
                    
                    <div>
                      <strong>Deskripsi Soal:</strong>
                      <pre className="p-3 bg-zinc-950 rounded border border-zinc-900 text-gray-400 text-[10px] mt-1 whitespace-pre-wrap">{selectedDraft.generatedDescription}</pre>
                    </div>
                    <div>
                      <strong>Hint:</strong>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-900 text-gray-400 mt-1">{selectedDraft.generatedHint}</div>
                    </div>
                    <div>
                      <strong>Solusi Pembahasan:</strong>
                      <pre className="p-3 bg-zinc-950 rounded border border-zinc-900 text-gray-400 text-[10px] mt-1 whitespace-pre-wrap">{selectedDraft.generatedSolution}</pre>
                    </div>

                    <div className="flex gap-2 font-mono text-xs border-t border-zinc-900 pt-5">
                      <button
                        onClick={() => handleReviewDraft('APPROVED')}
                        disabled={reviewing}
                        className="flex-1 py-2.5 rounded bg-cyber-green text-cyber-bg font-bold hover:bg-cyber-green-dim transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Check className="h-4 w-4" /> Setujui & Publish Live
                      </button>
                      <button
                        onClick={() => handleReviewDraft('REJECTED')}
                        disabled={reviewing}
                        className="px-6 py-2.5 rounded bg-cyber-red text-white font-bold hover:bg-rose-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <X className="h-4 w-4" /> Tolak Draf Soal
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-12">
                  Pilih draf generator pending di sebelah kiri untuk me-review konten soal dan mempublikasikannya langsung ke board tantangan CTF.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: MANAGE COURSES */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Course Aktif ({courses.length})</h3>
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2">
                {courses.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-zinc-950/60 rounded border border-zinc-900 flex justify-between items-center text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-white block">{c.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{c.level}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create form */}
            <div className="lg:col-span-7">
              <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                <h3 className="font-mono text-sm font-bold text-white border-b border-zinc-900 pb-3">Tambah Course Baru</h3>
                <form onSubmit={handleCreateCourse} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">Judul Course</label>
                    <input
                      type="text"
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      placeholder="e.g. Linux & Networking Basic"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white placeholder-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Deskripsi Course</label>
                    <textarea
                      value={newCourseDesc}
                      onChange={(e) => setNewCourseDesc(e.target.value)}
                      placeholder="Tulis deskripsi detail tentang apa saja yang akan dipelajari di course ini..."
                      rows={3}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white placeholder-gray-700 resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Tingkat Kesulitan</label>
                    <select
                      value={newCourseLevel}
                      onChange={(e) => setNewCourseLevel(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white"
                    >
                      <option value="BEGINNER">BEGINNER</option>
                      <option value="INTERMEDIATE">INTERMEDIATE</option>
                      <option value="ADVANCED">ADVANCED</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-cyber-blue text-white font-bold transition-all border border-cyber-blue/40 cursor-pointer"
                  >
                    Simpan & Publish Course
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: MANAGE CHALLENGES */}
        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Tantangan CTF ({challenges.length})</h3>
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2">
                {challenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 bg-zinc-950/60 rounded border border-zinc-900 flex justify-between items-center text-xs font-mono"
                  >
                    <div>
                      <span className="font-bold text-white block">{ch.title}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{ch.category} ({ch.point} pts)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create form */}
            <div className="lg:col-span-7">
              <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                <h3 className="font-mono text-sm font-bold text-white border-b border-zinc-900 pb-3">Tambah Tantangan CTF Baru</h3>
                <form onSubmit={handleCreateChallenge} className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 block mb-1">Judul Soal</label>
                      <input
                        type="text"
                        value={newChTitle}
                        onChange={(e) => setNewChTitle(e.target.value)}
                        placeholder="e.g. Cryptography: Caesar Cipher"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Poin Reward</label>
                      <input
                        type="number"
                        value={newChPoint}
                        onChange={(e) => setNewChPoint(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                        min={1}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 block mb-1">Kategori</label>
                      <select
                        value={newChCat}
                        onChange={(e) => setNewChCat(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      >
                        <option value="WEB">WEB EXPLOITATION</option>
                        <option value="CRYPTO">CRYPTOGRAPHY</option>
                        <option value="FORENSICS">FORENSICS</option>
                        <option value="OSINT">OSINT</option>
                        <option value="MISC">MISCELLANEOUS</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Kesulitan</label>
                      <select
                        value={newChDiff}
                        onChange={(e) => setNewChDiff(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                      >
                        <option value="EASY">EASY</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HARD">HARD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 block mb-1">Deskripsi Tantangan</label>
                    <textarea
                      value={newChDesc}
                      onChange={(e) => setNewChDesc(e.target.value)}
                      placeholder="Masukkan panduan deskripsi soal..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-cyber-green block mb-1 font-bold">Kunci Flag (Plain Text)</label>
                      <input
                        type="text"
                        value={newChFlag}
                        onChange={(e) => setNewChFlag(e.target.value)}
                        placeholder="CTF{kunci_flag_jawaban}"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Petunjuk / Hint (Optional)</label>
                      <input
                        type="text"
                        value={newChHint}
                        onChange={(e) => setNewChHint(e.target.value)}
                        placeholder="Coba gunakan..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-500 block mb-1">Writeup Solusi Pembahasan (Optional)</label>
                    <textarea
                      value={newChSol}
                      onChange={(e) => setNewChSol(e.target.value)}
                      placeholder="Langkah penyelesaian mendalam..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-cyber-green text-cyber-bg font-bold transition-all border border-cyber-green/40 cursor-pointer"
                  >
                    Simpan & Publish Soal CTF
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: AUDIT TRAIL LOGS */}
        {activeTab === 'logs' && (
          <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 font-mono text-xs">
            <h3 className="text-sm font-bold text-white mb-4 border-b border-zinc-900 pb-3 flex justify-between items-center">
              <span>Admin Audit Trail Logs</span>
              <button
                onClick={fetchAdminData}
                className="text-[10px] text-cyber-blue hover:text-white flex items-center gap-1.5 transition-colors border border-cyber-blue/30 px-2.5 py-1 rounded bg-cyber-blue/5 hover:bg-cyber-blue/10 cursor-pointer"
              >
                Refresh Logs
              </button>
            </h3>

            {adminLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-gray-400">
                  <thead>
                    <tr className="border-b border-zinc-900 text-gray-500 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-semibold">Admin</th>
                      <th className="pb-3 font-semibold">Action</th>
                      <th className="pb-3 font-semibold">Target (Type/ID)</th>
                      <th className="pb-3 font-semibold">Description</th>
                      <th className="pb-3 font-semibold text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900/60 font-mono">
                    {adminLogs.map((log) => {
                      const actionColors = {
                        APPROVE_BUG_REPORT: 'bg-cyber-green/10 text-cyber-green border-cyber-green/20',
                        REJECT_BUG_REPORT: 'bg-cyber-red/10 text-cyber-red border-cyber-red/20',
                        PUBLISH_DRAFT: 'bg-cyber-purple/10 text-cyber-purple border-cyber-purple/20',
                        REJECT_DRAFT: 'bg-zinc-800 text-gray-400 border-zinc-700',
                      };

                      return (
                        <tr key={log.id} className="hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3.5 font-medium text-white pr-2">
                            <div>{log.admin.name}</div>
                            <div className="text-[9px] text-gray-500">{log.admin.email}</div>
                          </td>
                          <td className="py-3.5">
                            <span className={`text-[9px] px-2 py-0.5 rounded border uppercase font-bold ${actionColors[log.action as keyof typeof actionColors] || 'bg-zinc-800 text-gray-300 border-zinc-700'}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <div className="text-[10px] text-gray-300 font-bold">{log.targetType}</div>
                            <div className="text-[9px] text-gray-500 font-normal">{log.targetId.slice(0, 8)}...</div>
                          </td>
                          <td className="py-3.5 text-gray-300 max-w-[300px] whitespace-pre-wrap">{log.description}</td>
                          <td className="py-3.5 text-right text-gray-500 text-[10px]">
                            {new Date(log.createdAt).toLocaleString('id-ID', {
                              dateStyle: 'short',
                              timeStyle: 'medium'
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-zinc-900 rounded-lg text-xs text-gray-500">
                Belum ada log aktivitas admin tercatat.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
