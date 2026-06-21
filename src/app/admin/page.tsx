'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { 
  Cpu, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Target, 
  Users, 
  Check, 
  X, 
  ShieldAlert, 
  ChevronRight, 
  Award, 
  Trash2, 
  Edit2, 
  Plus, 
  ArrowLeft 
} from 'lucide-react';

interface User {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  orderIndex: number;
}

interface Module {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  modules: Module[];
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  point: number;
  hint?: string | null;
  solution?: string | null;
  relatedLessonId?: string | null;
  flag?: string;
}

interface BugBountyProgram {
  id: string;
  title: string;
  description: string;
  scope: string;
  outOfScope: string;
  labUrl: string;
  rewardPoint: number;
  isActive: boolean;
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
  
  const [activeTab, setActiveTab] = useState<'reports' | 'drafts' | 'courses' | 'challenges' | 'programs' | 'logs'>('reports');
  const [loading, setLoading] = useState(true);
  
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
  const [programs, setPrograms] = useState<BugBountyProgram[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  // Selection for review/editing
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Edit Modals states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [editingProgram, setEditingProgram] = useState<BugBountyProgram | null>(null);

  // Nested Course content states
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<Course | null>(null);
  const [selectedModuleForLessons, setSelectedModuleForLessons] = useState<Module | null>(null);

  // Review actions fields
  const [reportReviewStatus, setReportReviewStatus] = useState('VALID');
  const [reportReviewPoints, setReportReviewPoints] = useState('100');
  const [reviewing, setReviewing] = useState(false);

  // CRUD Course form
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCourseLevel, setNewCourseLevel] = useState('BEGINNER');

  // CRUD Module form
  const [newModTitle, setNewModTitle] = useState('');
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  // CRUD Lesson form
  const [newLesTitle, setNewLesTitle] = useState('');
  const [newLesContent, setNewLesContent] = useState('');
  const [newLesVideo, setNewLesVideo] = useState('');
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // CRUD Challenge form
  const [newChTitle, setNewChTitle] = useState('');
  const [newChDesc, setNewChDesc] = useState('');
  const [newChCat, setNewChCat] = useState('WEB');
  const [newChDiff, setNewChDiff] = useState('EASY');
  const [newChPoint, setNewChPoint] = useState('100');
  const [newChFlag, setNewChFlag] = useState('');
  const [newChHint, setNewChHint] = useState('');
  const [newChSol, setNewChSol] = useState('');
  const [newChLessonId, setNewChLessonId] = useState('');

  // CRUD Program form
  const [newProgTitle, setNewProgTitle] = useState('');
  const [newProgDesc, setNewProgDesc] = useState('');
  const [newProgScope, setNewProgScope] = useState('');
  const [newProgOutScope, setNewProgOutScope] = useState('');
  const [newProgLabUrl, setNewProgLabUrl] = useState('');
  const [newProgPoints, setNewProgPoints] = useState('200');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Fetch stats & lists
      const reportsRes = await fetch('/api/bug-bounty/reports');
      const draftsRes = await fetch('/api/generate');
      const coursesRes = await fetch('/api/courses');
      const chRes = await fetch('/api/challenges');
      const lbRes = await fetch('/api/leaderboard');
      const logsRes = await fetch('/api/admin/logs');
      const progRes = await fetch('/api/bug-bounty');

      if (reportsRes.ok && draftsRes.ok && coursesRes.ok && chRes.ok && lbRes.ok && logsRes.ok && progRes.ok) {
        const reportsData = await reportsRes.json();
        const draftsData = await draftsRes.json();
        const coursesData = await coursesRes.json();
        const chData = await chRes.json();
        const lbData = await lbRes.json();
        const logsData = await logsRes.json();
        const progData = await progRes.json();

        const pReports = reportsData.reports.filter((r: any) => r.status === 'PENDING');
        const pDrafts = draftsData.drafts.filter((d: any) => d.status === 'PENDING');

        setPendingReports(pReports);
        setPendingDrafts(pDrafts);
        setCourses(coursesData.courses);
        setChallenges(chData.challenges);
        setAdminLogs(logsData.logs);
        setPrograms(progData.programs);

        // Keep selected dynamic context fresh if loaded in UI
        if (selectedCourseForModules) {
          const freshCourse = coursesData.courses.find((c: any) => c.id === selectedCourseForModules.id);
          if (freshCourse) {
            setSelectedCourseForModules(freshCourse);
            if (selectedModuleForLessons) {
              const freshMod = freshCourse.modules.find((m: any) => m.id === selectedModuleForLessons.id);
              if (freshMod) {
                setSelectedModuleForLessons(freshMod);
              } else {
                setSelectedModuleForLessons(null);
              }
            }
          } else {
            setSelectedCourseForModules(null);
            setSelectedModuleForLessons(null);
          }
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
        alert(`Ulasan laporan bug berhasil diserahkan dengan status: ${status}`);
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
        alert(`Draf telah ${status === 'APPROVED' ? 'DISETUJUI & DIPUBLIKASIKAN secara live' : 'DITOLAK'}.`);
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

  // CRUD Course Handlers
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

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      const res = await fetch(`/api/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCourse),
      });

      if (res.ok) {
        alert('Course berhasil diperbarui!');
        setEditingCourse(null);
        fetchAdminData();
      } else {
        alert('Gagal memperbarui course.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus course ini? Semua modul dan materi di dalamnya akan ikut terhapus.')) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Course berhasil dihapus.');
        fetchAdminData();
      } else {
        alert('Gagal menghapus course.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Module Handlers
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForModules) return;
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourseForModules.id,
          title: newModTitle,
          orderIndex: selectedCourseForModules.modules.length + 1,
        }),
      });

      if (res.ok) {
        setNewModTitle('');
        fetchAdminData();
      } else {
        alert('Gagal membuat modul.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModule) return;
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingModule.id,
          title: editingModule.title,
        }),
      });

      if (res.ok) {
        setEditingModule(null);
        fetchAdminData();
      } else {
        alert('Gagal mengubah modul.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm('Hapus modul ini beserta semua pelajarannya?')) return;
    try {
      const res = await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Gagal menghapus modul.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Lesson Handlers
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleForLessons) return;
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleForLessons.id,
          title: newLesTitle,
          content: newLesContent,
          videoUrl: newLesVideo || null,
          orderIndex: selectedModuleForLessons.lessons.length + 1,
        }),
      });

      if (res.ok) {
        setNewLesTitle('');
        setNewLesContent('');
        setNewLesVideo('');
        fetchAdminData();
      } else {
        alert('Gagal menambahkan pelajaran.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson) return;
    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLesson.id,
          title: editingLesson.title,
          content: editingLesson.content,
          videoUrl: editingLesson.videoUrl || null,
        }),
      });

      if (res.ok) {
        setEditingLesson(null);
        fetchAdminData();
      } else {
        alert('Gagal memperbarui pelajaran.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('Hapus pelajaran ini?')) return;
    try {
      const res = await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Gagal menghapus pelajaran.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Challenge Handlers
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
          relatedLessonId: newChLessonId || null,
        }),
      });

      if (res.ok) {
        alert('Tantangan CTF baru berhasil ditambahkan!');
        setNewChTitle('');
        setNewChDesc('');
        setNewChFlag('');
        setNewChHint('');
        setNewChSol('');
        setNewChLessonId('');
        fetchAdminData();
      } else {
        alert('Gagal membuat tantangan.');
      }
    } catch (err) {
      console.error('Error creating challenge:', err);
    }
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    try {
      const res = await fetch(`/api/admin/challenges/${editingChallenge.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingChallenge),
      });

      if (res.ok) {
        alert('Tantangan berhasil diperbarui!');
        setEditingChallenge(null);
        fetchAdminData();
      } else {
        alert('Gagal memperbarui tantangan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    if (!confirm('Hapus tantangan ini secara permanen?')) return;
    try {
      const res = await fetch(`/api/admin/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Tantangan berhasil dihapus.');
        fetchAdminData();
      } else {
        alert('Gagal menghapus tantangan.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Bug Bounty Program Handlers
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/bug-bounty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProgTitle,
          description: newProgDesc,
          scope: newProgScope,
          outOfScope: newProgOutScope,
          labUrl: newProgLabUrl,
          rewardPoint: parseInt(newProgPoints),
        }),
      });

      if (res.ok) {
        alert('Program Bug Bounty baru berhasil dibuat!');
        setNewProgTitle('');
        setNewProgDesc('');
        setNewProgScope('');
        setNewProgOutScope('');
        setNewProgLabUrl('');
        fetchAdminData();
      } else {
        alert('Gagal membuat program.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    try {
      const res = await fetch(`/api/admin/bug-bounty/${editingProgram.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProgram),
      });

      if (res.ok) {
        alert('Program berhasil diperbarui!');
        setEditingProgram(null);
        fetchAdminData();
      } else {
        alert('Gagal memperbarui program.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Hapus program bug bounty ini?')) return;
    try {
      const res = await fetch(`/api/admin/bug-bounty/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Program berhasil dihapus.');
        fetchAdminData();
      } else {
        alert('Gagal menghapus program.');
      }
    } catch (err) {
      console.error(err);
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
        <div className="flex flex-wrap border-b border-zinc-900 mb-8 font-mono text-xs sm:text-sm gap-2">
          <button
            onClick={() => { setActiveTab('reports'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'reports' ? 'border-cyber-red text-cyber-red glow-red' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Review Bugs ({pendingReports.length})
          </button>
          <button
            onClick={() => { setActiveTab('drafts'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'drafts' ? 'border-cyber-purple text-cyber-purple glow-purple' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Approve Drafts ({pendingDrafts.length})
          </button>
          <button
            onClick={() => { setActiveTab('courses'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'courses' ? 'border-cyber-blue text-cyber-blue glow-blue' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            Manage Courses
          </button>
          <button
            onClick={() => { setActiveTab('challenges'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'challenges' ? 'border-cyber-green text-cyber-green glow-green' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            Manage Challenges
          </button>
          <button
            onClick={() => { setActiveTab('programs'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeTab === 'programs' ? 'border-cyber-blue text-cyber-blue' : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            Manage Programs
          </button>
          <button
            onClick={() => { setActiveTab('logs'); setSelectedCourseForModules(null); }}
            className={`pb-3 px-3 border-b-2 font-bold transition-all flex items-center gap-2 ${
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
              {selectedCourseForModules ? (
                // Modules lists nested sub-panel
                <div className="space-y-4 font-mono">
                  <div className="flex items-center gap-2 text-cyber-blue font-bold text-xs uppercase mb-2">
                    <button 
                      onClick={() => { setSelectedCourseForModules(null); setSelectedModuleForLessons(null); }}
                      className="p-1 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span>Modul: {selectedCourseForModules.title}</span>
                  </div>

                  <div className="cyber-panel p-4 rounded-xl border border-cyber-blue/20 bg-zinc-950/40 space-y-3">
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-zinc-900 pb-1.5 font-bold">List Modules</h4>
                    {selectedCourseForModules.modules && selectedCourseForModules.modules.length > 0 ? (
                      selectedCourseForModules.modules.map((m) => (
                        <div key={m.id} className="p-3 bg-zinc-950 rounded border border-zinc-900 flex justify-between items-center text-xs">
                          {editingModule?.id === m.id ? (
                            <form onSubmit={handleUpdateModule} className="flex gap-2 w-full">
                              <input 
                                type="text"
                                value={editingModule.title}
                                onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                                className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white flex-1 text-xs"
                                required
                              />
                              <button type="submit" className="text-cyber-green hover:underline">Save</button>
                              <button type="button" onClick={() => setEditingModule(null)} className="text-cyber-red hover:underline">Cancel</button>
                            </form>
                          ) : (
                            <>
                              <div className="flex-1">
                                <span className="text-white font-bold block">{m.title}</span>
                                <span className="text-[9px] text-gray-500 uppercase">Index: {m.orderIndex} ({m.lessons?.length || 0} Lessons)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setSelectedModuleForLessons(m)}
                                  className="text-[10px] px-2 py-0.5 rounded bg-cyber-blue/15 text-cyber-blue hover:bg-cyber-blue/25 border border-cyber-blue/25"
                                >
                                  Lessons
                                </button>
                                <button onClick={() => setEditingModule(m)} className="text-gray-500 hover:text-white"><Edit2 className="h-3.5 w-3.5" /></button>
                                <button onClick={() => handleDeleteModule(m.id)} className="text-cyber-red hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-gray-500">Belum ada modul.</div>
                    )}

                    <form onSubmit={handleCreateModule} className="border-t border-zinc-900 pt-3 flex gap-2">
                      <input
                        type="text"
                        value={newModTitle}
                        onChange={(e) => setNewModTitle(e.target.value)}
                        placeholder="Nama modul baru..."
                        className="bg-zinc-950 border border-zinc-800 rounded p-2 text-white flex-1 text-xs"
                        required
                      />
                      <button type="submit" className="p-2 rounded bg-cyber-blue text-white hover:bg-blue-600"><Plus className="h-4 w-4" /></button>
                    </form>
                  </div>

                  {selectedModuleForLessons && (
                    // Lessons sub-panel
                    <div className="cyber-panel p-4 rounded-xl border border-cyber-green/20 bg-zinc-950/40 space-y-3">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Lessons: {selectedModuleForLessons.title}</span>
                        <button onClick={() => setSelectedModuleForLessons(null)} className="text-[9px] text-cyber-red hover:underline">Close</button>
                      </div>

                      {selectedModuleForLessons.lessons && selectedModuleForLessons.lessons.length > 0 ? (
                        selectedModuleForLessons.lessons.map((l) => (
                          <div key={l.id} className="p-3 bg-zinc-950 rounded border border-zinc-900 flex justify-between items-center text-xs">
                            <div className="flex-1 pr-2">
                              <span className="text-white font-bold block">{l.title}</span>
                              <span className="text-[9px] text-gray-500 uppercase">Index: {l.orderIndex}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => setEditingLesson(l)} className="text-gray-500 hover:text-white"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleDeleteLesson(l.id)} className="text-cyber-red hover:text-white"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-xs text-gray-500">Belum ada pelajaran.</div>
                      )}

                      <form onSubmit={handleCreateLesson} className="border-t border-zinc-900 pt-3 space-y-2">
                        <input
                          type="text"
                          value={newLesTitle}
                          onChange={(e) => setNewLesTitle(e.target.value)}
                          placeholder="Judul pelajaran..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                          required
                        />
                        <textarea
                          value={newLesContent}
                          onChange={(e) => setNewLesContent(e.target.value)}
                          placeholder="Konten pelajaran (Markdown)..."
                          rows={3}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs resize-none"
                          required
                        />
                        <input
                          type="text"
                          value={newLesVideo}
                          onChange={(e) => setNewLesVideo(e.target.value)}
                          placeholder="Video URL (optional)..."
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white text-xs"
                        />
                        <button type="submit" className="w-full py-1.5 rounded bg-cyber-green text-cyber-bg font-bold text-xs hover:bg-cyber-green-dim">
                          Add Lesson
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                // Courses active lists
                <div className="space-y-4">
                  <h3 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Course Aktif ({courses.length})</h3>
                  <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2 font-mono">
                    {courses.map((c) => (
                      <div
                        key={c.id}
                        className="p-3.5 bg-zinc-950/60 rounded border border-zinc-900 flex justify-between items-center text-xs"
                      >
                        <div className="flex-1 pr-2">
                          <span className="font-bold text-white block">{c.title}</span>
                          <span className="text-[9px] text-gray-500 uppercase">{c.level} ({c.modules?.length || 0} Modules)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedCourseForModules(c)}
                            className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/25 hover:bg-purple-500/20"
                          >
                            Modules
                          </button>
                          <button 
                            onClick={() => setEditingCourse(c)}
                            className="p-1 hover:text-white text-gray-500"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(c.id)}
                            className="p-1 hover:text-white text-cyber-red"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2 font-mono">
                {challenges.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3 bg-zinc-950/60 rounded border border-zinc-900 flex justify-between items-center text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-white block">{ch.title}</span>
                      <span className="text-[9px] text-gray-500 uppercase">{ch.category} ({ch.point} pts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingChallenge(ch)}
                        className="p-1 hover:text-white text-gray-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteChallenge(ch.id)}
                        className="p-1 hover:text-white text-cyber-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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

                  <div className="grid grid-cols-3 gap-4">
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
                    <div>
                      <label className="text-gray-500 block mb-1">ID Pelajaran (Optional)</label>
                      <input 
                        type="text"
                        value={newChLessonId}
                        onChange={(e) => setNewChLessonId(e.target.value)}
                        placeholder="UUID Pelajaran..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700"
                      />
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

        {/* Tab 5: MANAGE PROGRAMS */}
        {activeTab === 'programs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* List */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest">Daftar Bug Program ({programs.length})</h3>
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[50vh] overflow-y-auto space-y-2 font-mono">
                {programs.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-zinc-950/60 rounded border border-zinc-900 flex justify-between items-center text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <span className="font-bold text-white block">{p.title}</span>
                      <span className="text-[9px] text-gray-500 uppercase">Reward: {p.rewardPoint} pts ({p.isActive ? 'Active' : 'Inactive'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingProgram(p)}
                        className="p-1 hover:text-white text-gray-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProgram(p.id)}
                        className="p-1 hover:text-white text-cyber-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create form */}
            <div className="lg:col-span-7">
              <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-4">
                <h3 className="font-mono text-sm font-bold text-white border-b border-zinc-900 pb-3">Tambah Program Bug Bounty Baru</h3>
                <form onSubmit={handleCreateProgram} className="space-y-4 font-mono text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">Nama Program / Aplikasi</label>
                    <input
                      type="text"
                      value={newProgTitle}
                      onChange={(e) => setNewProgTitle(e.target.value)}
                      placeholder="e.g. CyberShop E-Commerce"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white placeholder-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Deskripsi Target</label>
                    <textarea
                      value={newProgDesc}
                      onChange={(e) => setNewProgDesc(e.target.value)}
                      placeholder="Uraikan detail program..."
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-2.5 text-white placeholder-gray-700 resize-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 block mb-1">Scope</label>
                      <textarea
                        value={newProgScope}
                        onChange={(e) => setNewProgScope(e.target.value)}
                        placeholder="Daftar domain/API yang diizinkan..."
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Out of Scope</label>
                      <textarea
                        value={newProgOutScope}
                        onChange={(e) => setNewProgOutScope(e.target.value)}
                        placeholder="Jenis pengujian yang dilarang..."
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 resize-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-500 block mb-1">Lab URL Route</label>
                      <input
                        type="text"
                        value={newProgLabUrl}
                        onChange={(e) => setNewProgLabUrl(e.target.value)}
                        placeholder="e.g. /labs/cybershop"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gray-500 block mb-1">Maksimum Reward Point</label>
                      <input
                        type="number"
                        value={newProgPoints}
                        onChange={(e) => setNewProgPoints(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                        min={10}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded bg-cyber-blue text-white font-bold transition-all border border-cyber-blue/40 cursor-pointer"
                  >
                    Simpan & Aktifkan Program Bug Bounty
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: AUDIT TRAIL LOGS */}
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
                            <div>{log.admin?.name}</div>
                            <div className="text-[9px] text-gray-500">{log.admin?.email}</div>
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

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs">
          <div className="cyber-panel p-6 rounded-2xl border border-cyber-blue/30 bg-cyber-bg max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-cyber-blue border-b border-zinc-900 pb-2">Edit Course</h3>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="text-gray-500 block mb-1">Judul Course</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Deskripsi</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  rows={4}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 block mb-1">Level</label>
                  <select
                    value={editingCourse.level}
                    onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Status Publikasi</label>
                  <select
                    value={editingCourse.isPublished ? 'TRUE' : 'FALSE'}
                    onChange={(e) => setEditingCourse({ ...editingCourse, isPublished: e.target.value === 'TRUE' })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="TRUE">PUBLISHED</option>
                    <option value="FALSE">UNPUBLISHED</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 rounded bg-cyber-blue text-white font-bold hover:bg-blue-600">
                  Update Course
                </button>
                <button type="button" onClick={() => setEditingCourse(null)} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {editingChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs overflow-y-auto">
          <div className="cyber-panel p-6 rounded-2xl border border-cyber-green/30 bg-cyber-bg max-w-lg w-full space-y-4 my-8">
            <h3 className="text-sm font-bold text-cyber-green border-b border-zinc-900 pb-2">Edit Challenge</h3>
            <form onSubmit={handleUpdateChallenge} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 block mb-1">Judul Soal</label>
                  <input
                    type="text"
                    value={editingChallenge.title}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, title: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Poin</label>
                  <input
                    type="number"
                    value={editingChallenge.point}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, point: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 block mb-1">Kategori</label>
                  <select
                    value={editingChallenge.category}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, category: e.target.value })}
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
                    value={editingChallenge.difficulty}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, difficulty: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  >
                    <option value="EASY">EASY</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HARD">HARD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Deskripsi</label>
                <textarea
                  value={editingChallenge.description}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, description: e.target.value })}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-cyber-green block mb-1 font-bold">Kunci Flag (Biarkan kosong jika tidak diubah)</label>
                  <input
                    type="text"
                    value={editingChallenge.flag || ''}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, flag: e.target.value })}
                    placeholder="Masukkan flag baru..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Petunjuk / Hint</label>
                  <input
                    type="text"
                    value={editingChallenge.hint || ''}
                    onChange={(e) => setEditingChallenge({ ...editingChallenge, hint: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Writeup Pembahasan</label>
                <textarea
                  value={editingChallenge.solution || ''}
                  onChange={(e) => setEditingChallenge({ ...editingChallenge, solution: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 rounded bg-cyber-green text-cyber-bg font-bold hover:bg-cyber-green-dim">
                  Update Challenge
                </button>
                <button type="button" onClick={() => setEditingChallenge(null)} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono text-xs overflow-y-auto">
          <div className="cyber-panel p-6 rounded-2xl border border-cyber-blue/30 bg-cyber-bg max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-cyber-blue border-b border-zinc-900 pb-2">Edit Bug Bounty Program</h3>
            <form onSubmit={handleUpdateProgram} className="space-y-4">
              <div>
                <label className="text-gray-500 block mb-1">Nama Program</label>
                <input
                  type="text"
                  value={editingProgram.title}
                  onChange={(e) => setEditingProgram({ ...editingProgram, title: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Deskripsi</label>
                <textarea
                  value={editingProgram.description}
                  onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-500 block mb-1">Scope</label>
                  <textarea
                    value={editingProgram.scope}
                    onChange={(e) => setEditingProgram({ ...editingProgram, scope: e.target.value })}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Out of Scope</label>
                  <textarea
                    value={editingProgram.outOfScope}
                    onChange={(e) => setEditingProgram({ ...editingProgram, outOfScope: e.target.value })}
                    rows={2}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white resize-none"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-gray-500 block mb-1">Lab URL Route</label>
                  <input
                    type="text"
                    value={editingProgram.labUrl}
                    onChange={(e) => setEditingProgram({ ...editingProgram, labUrl: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-500 block mb-1">Reward Poin</label>
                  <input
                    type="number"
                    value={editingProgram.rewardPoint}
                    onChange={(e) => setEditingProgram({ ...editingProgram, rewardPoint: parseInt(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-gray-500 block mb-1">Status Keaktifan</label>
                <select
                  value={editingProgram.isActive ? 'TRUE' : 'FALSE'}
                  onChange={(e) => setEditingProgram({ ...editingProgram, isActive: e.target.value === 'TRUE' })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white"
                >
                  <option value="TRUE">ACTIVE</option>
                  <option value="FALSE">INACTIVE</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 py-2 rounded bg-cyber-blue text-white font-bold hover:bg-blue-600">
                  Update Program
                </button>
                <button type="button" onClick={() => setEditingProgram(null)} className="px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
