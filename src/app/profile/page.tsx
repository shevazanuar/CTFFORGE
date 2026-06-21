'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Shield, Trophy, Award, Target, FileText, Calendar, CheckCircle2, AlertOctagon, RefreshCw, BarChart2, Layers } from 'lucide-react';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    totalPoint: number;
    createdAt: string;
    badges: Array<{
      id: string;
      earnedAt: string;
      badge: {
        id: string;
        name: string;
        description: string;
        iconUrl: string;
        condition: string;
      }
    }>;
  };
  rank: number;
  solveHistory: Array<{
    id: string;
    pointEarned: number;
    submittedAt: string;
    challenge: {
      id: string;
      title: string;
      category: string;
      difficulty: string;
      point: number;
    };
  }>;
  bugReports: Array<{
    id: string;
    title: string;
    vulnerabilityType: string;
    severity: string;
    status: string;
    pointAwarded: number;
    createdAt: string;
    program: {
      id: string;
      title: string;
    };
  }>;
  pointTransactions: Array<{
    id: string;
    sourceType: string;
    point: number;
    description: string;
    createdAt: string;
  }>;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'solves' | 'reports' | 'transactions'>('solves');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const profileData = await res.json();
          setData(profileData);
        } else {
          const errData = await res.json();
          setError(errData.error || 'Gagal mengambil data profil.');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Terjadi kesalahan pada server saat mengambil data profil.');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-8 w-8 text-cyber-purple animate-spin" />
          <p className="font-mono text-xs tracking-wider text-gray-400">MEMPROSES DATA DOSIR AGEN...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 max-w-md mx-auto text-center px-4">
          <AlertOctagon className="h-10 w-10 text-cyber-red" />
          <h2 className="font-mono text-lg font-bold text-white">Akses Profil Gagal</h2>
          <p className="font-mono text-xs text-gray-400 leading-relaxed">{error || 'Silakan masuk terlebih dahulu.'}</p>
        </div>
      </div>
    );
  }

  const { user: profileUser, rank, solveHistory, bugReports, pointTransactions } = data;

  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        {/* Agent Dossier Header */}
        <div className="mb-8 p-6 rounded-2xl cyber-panel border border-purple-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-purple-500/5 blur-3xl"></div>
          
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 glow-purple">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-cyber-purple tracking-widest uppercase font-semibold">Agent Profile Dossier</span>
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2 mt-1">
                {profileUser.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs font-mono text-gray-400">
                <span>ID: <span className="text-gray-300">Agent-{profileUser.id.slice(0, 8)}</span></span>
                <span className="text-zinc-700">•</span>
                <span>Role: <span className="text-cyber-green font-bold uppercase">{profileUser.role}</span></span>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Registered {joinDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            {/* Rank Box */}
            <div className="flex-1 md:flex-initial p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col min-w-[120px]">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Global Rank</span>
              <span className="text-2xl font-mono font-bold text-cyber-blue glow-blue mt-1">#{rank}</span>
            </div>

            {/* Score Box */}
            <div className="flex-1 md:flex-initial p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col min-w-[120px]">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Total Points</span>
              <span className="text-2xl font-mono font-bold text-cyber-green glow-green mt-1">{profileUser.totalPoint} pts</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Badges & Skill Metrics */}
          <div className="space-y-8">
            
            {/* Badges Grid */}
            <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
              <h2 className="font-mono text-sm font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-wide">
                <Award className="h-4 w-4 text-cyber-purple" />
                Earned Badges ({profileUser.badges.length})
              </h2>

              {profileUser.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {profileUser.badges.map((ub) => (
                    <div
                      key={ub.id}
                      className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-900 flex flex-col items-center text-center group hover:border-cyber-purple/30 transition-all duration-200"
                    >
                      <span className="text-3xl mb-2 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform" title={ub.badge.name}>
                        {ub.badge.iconUrl}
                      </span>
                      <div className="font-mono text-xs font-bold text-white leading-tight mb-1">{ub.badge.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono leading-relaxed mt-1 line-clamp-2">{ub.badge.description}</div>
                      <div className="text-[8px] text-purple-400 font-mono mt-2 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/15 uppercase">
                        {ub.badge.condition}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-zinc-800 rounded-lg text-xs font-mono text-gray-500">
                  <Award className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  Belum ada lencana yang diraih.
                </div>
              )}
            </div>

            {/* Quick stats summary */}
            <div className="cyber-panel p-6 rounded-xl border border-purple-500/15 font-mono">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
                <BarChart2 className="h-4 w-4 text-cyber-green" />
                Activity Metrics
              </h2>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-gray-500">Challenges Solved</span>
                  <span className="text-white font-bold">{solveHistory.length}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-gray-500">Bug Reports Submitted</span>
                  <span className="text-white font-bold">{bugReports.length}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-2">
                  <span className="text-gray-500">Valid Bug Reports</span>
                  <span className="text-cyber-green font-bold">
                    {bugReports.filter(r => r.status === 'VALID').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Log Transaction Entries</span>
                  <span className="text-cyber-blue font-bold">{pointTransactions.length}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Columns: Activity Ledger / History Tabs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="cyber-panel rounded-xl border border-purple-500/15 overflow-hidden">
              
              {/* Tabs Navigation */}
              <div className="flex border-b border-zinc-900 bg-zinc-950/60 p-1">
                <button
                  onClick={() => setActiveTab('solves')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold tracking-wide uppercase transition-all rounded-lg border ${
                    activeTab === 'solves'
                      ? 'bg-purple-500/10 text-cyber-green border-purple-500/25 glow-green'
                      : 'text-gray-500 hover:text-gray-300 border-transparent'
                  }`}
                >
                  <Target className="h-4 w-4" />
                  Challenge Solves ({solveHistory.length})
                </button>
                
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold tracking-wide uppercase transition-all rounded-lg border ${
                    activeTab === 'reports'
                      ? 'bg-purple-500/10 text-cyber-green border-purple-500/25 glow-green'
                      : 'text-gray-500 hover:text-gray-300 border-transparent'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Bug Reports ({bugReports.length})
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono font-bold tracking-wide uppercase transition-all rounded-lg border ${
                    activeTab === 'transactions'
                      ? 'bg-purple-500/10 text-cyber-green border-purple-500/25 glow-green'
                      : 'text-gray-500 hover:text-gray-300 border-transparent'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Point Ledgers ({pointTransactions.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-6">
                
                {/* 1. Challenge Solves Tab */}
                {activeTab === 'solves' && (
                  <div className="space-y-4">
                    {solveHistory.length > 0 ? (
                      <div className="space-y-3">
                        {solveHistory.map((history) => (
                          <div
                            key={history.id}
                            className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                          >
                            <div>
                              <div className="font-mono text-sm font-bold text-white">
                                {history.challenge.title}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] font-mono">
                                <span className="text-cyber-blue uppercase">{history.challenge.category}</span>
                                <span className="text-zinc-800">•</span>
                                <span className={`font-bold ${
                                  history.challenge.difficulty === 'EASY' ? 'text-cyber-green' : history.challenge.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-cyber-red'
                                }`}>
                                  {history.challenge.difficulty}
                                </span>
                                <span className="text-zinc-800">•</span>
                                <span className="text-gray-500">
                                  {new Date(history.submittedAt).toLocaleString('id-ID', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                  })}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 self-start sm:self-center font-mono">
                              <span className="text-xs px-2 py-0.5 rounded bg-cyber-green/10 border border-cyber-green/20 text-cyber-green font-semibold">
                                +{history.pointEarned} pts
                              </span>
                              <CheckCircle2 className="h-4 w-4 text-cyber-green" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-lg text-xs font-mono text-gray-500">
                        <Target className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                        Belum ada tantangan yang diselesaikan.
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Bug Reports Tab */}
                {activeTab === 'reports' && (
                  <div className="space-y-4">
                    {bugReports.length > 0 ? (
                      <div className="space-y-3">
                        {bugReports.map((report) => {
                          const statusColors = {
                            PENDING: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
                            VALID: 'bg-cyber-green/10 border-cyber-green/30 text-cyber-green',
                            DUPLICATE: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
                            INFORMATIVE: 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue',
                            REJECTED: 'bg-cyber-red/10 border-cyber-red/30 text-cyber-red',
                          };

                          return (
                            <div
                              key={report.id}
                              className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:border-zinc-800 transition-all"
                            >
                              <div>
                                <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                                  {report.title}
                                  <span className="text-[10px] font-normal text-gray-500">({report.program.title})</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px] font-mono">
                                  <span className="text-gray-400 uppercase">Vuln: {report.vulnerabilityType}</span>
                                  <span className="text-zinc-800">•</span>
                                  <span className={`font-semibold ${
                                    report.severity === 'CRITICAL' || report.severity === 'HIGH' ? 'text-cyber-red' : report.severity === 'MEDIUM' ? 'text-amber-500' : 'text-cyber-blue'
                                  }`}>
                                    Severity: {report.severity}
                                  </span>
                                  <span className="text-zinc-800">•</span>
                                  <span className="text-gray-500">
                                    {new Date(report.createdAt).toLocaleDateString('id-ID', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-start sm:self-center font-mono">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-bold tracking-wide ${statusColors[report.status as keyof typeof statusColors] || 'text-gray-400'}`}>
                                  {report.status}
                                </span>
                                {report.pointAwarded > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-cyber-green/10 border border-cyber-green/20 text-cyber-green font-semibold">
                                    +{report.pointAwarded} pts
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-lg text-xs font-mono text-gray-500">
                        <FileText className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                        Belum ada laporan bug bounty yang diajukan.
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Point Ledgers Tab */}
                {activeTab === 'transactions' && (
                  <div className="space-y-4">
                    {pointTransactions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs text-gray-400">
                          <thead>
                            <tr className="border-b border-zinc-900 text-gray-500 uppercase tracking-wider text-[10px]">
                              <th className="pb-3 font-semibold">Deskripsi</th>
                              <th className="pb-3 font-semibold">Sumber</th>
                              <th className="pb-3 font-semibold text-right">Poin</th>
                              <th className="pb-3 font-semibold text-right">Tanggal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900/60">
                            {pointTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-zinc-900/10">
                                <td className="py-3.5 pr-2 font-medium text-white max-w-[200px] truncate">{tx.description}</td>
                                <td className="py-3.5">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                    tx.sourceType === 'BUG_REPORT'
                                      ? 'bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue'
                                      : tx.sourceType === 'CHALLENGE'
                                      ? 'bg-cyber-purple/10 border border-cyber-purple/20 text-cyber-purple'
                                      : 'bg-zinc-800 border border-zinc-700 text-gray-300'
                                  }`}>
                                    {tx.sourceType}
                                  </span>
                                </td>
                                <td className={`py-3.5 text-right font-bold text-sm ${tx.point >= 0 ? 'text-cyber-green' : 'text-cyber-red'}`}>
                                  {tx.point >= 0 ? `+${tx.point}` : tx.point}
                                </td>
                                <td className="py-3.5 text-right text-gray-500 text-[10px]">
                                  {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-zinc-900 rounded-lg text-xs font-mono text-gray-500">
                        <Layers className="h-8 w-8 text-zinc-800 mx-auto mb-2" />
                        Belum ada riwayat transaksi poin.
                      </div>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
