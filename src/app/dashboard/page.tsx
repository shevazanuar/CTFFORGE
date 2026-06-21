'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Shield, Trophy, Award, BookOpen, Target, Sparkles, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  point: number;
  solved: boolean;
}

interface LeaderboardUser {
  id: string;
  totalPoint: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [userRank, setUserRank] = useState<number | string>('-');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch challenges to calculate stats & recommend some
        const challengesRes = await fetch('/api/challenges');
        if (challengesRes.ok) {
          const chData = await challengesRes.json();
          setChallenges(chData.challenges);
        }

        // Fetch leaderboard to calculate rank
        const leaderboardRes = await fetch('/api/leaderboard');
        if (leaderboardRes.ok) {
          const lbData = await leaderboardRes.json();
          setLeaderboard(lbData.leaderboard);
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Compute Rank
  useEffect(() => {
    if (user && leaderboard.length > 0) {
      const index = leaderboard.findIndex((u) => u.id === user.id);
      if (index !== -1) {
        setUserRank(index + 1);
      }
    }
  }, [user, leaderboard]);

  // Statistics calculations
  const totalChallenges = challenges.length;
  const solvedChallenges = challenges.filter((ch) => ch.solved).length;
  const webSolved = challenges.filter((ch) => ch.solved && ch.category === 'WEB').length;
  const cryptoSolved = challenges.filter((ch) => ch.solved && ch.category === 'CRYPTO').length;
  const miscSolved = challenges.filter((ch) => ch.solved && (ch.category !== 'WEB' && ch.category !== 'CRYPTO')).length;

  const webTotal = challenges.filter((ch) => ch.category === 'WEB').length;
  const cryptoTotal = challenges.filter((ch) => ch.category === 'CRYPTO').length;
  const miscTotal = challenges.filter((ch) => ch.category !== 'WEB' && ch.category !== 'CRYPTO').length;

  const unsolved = challenges.filter((ch) => !ch.solved);
  const recommendedChallenges = unsolved.slice(0, 2);

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        {/* Welcome Section */}
        <div className="mb-8 p-6 rounded-2xl cyber-panel border border-purple-500/15 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-purple-500/5 blur-3xl"></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2">
              Welcome Back, Agent <span className="text-cyber-green glow-green">{user?.name}</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1.5 font-mono">
              Status Operasional: <span className="text-cyber-green glow-green">ONLINE</span> | ID: Agent-{user?.id?.slice(0, 8)}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/challenges"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyber-green/40 hover:text-cyber-green text-xs font-mono text-gray-300 transition-all"
            >
              Resume Lab
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Points */}
          <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Total Skor</p>
                <h3 className="text-3xl font-mono font-bold text-white mt-2 glow-green text-cyber-green">
                  {user?.totalPoint} <span className="text-xs text-gray-400 font-normal">pts</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-cyber-green/5 border border-cyber-green/20">
                <Trophy className="h-5 w-5 text-cyber-green" />
              </div>
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-3">Skor akumulasi dari CTF & Bug Bounty</p>
          </div>

          {/* Card 2: Rank */}
          <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Peringkat Global</p>
                <h3 className="text-3xl font-mono font-bold text-white mt-2 glow-blue text-cyber-blue">
                  #{userRank} <span className="text-xs text-gray-400 font-normal">/ {leaderboard.length}</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-cyber-blue/5 border border-cyber-blue/20">
                <Shield className="h-5 w-5 text-cyber-blue" />
              </div>
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-3">Posisi Anda di papan skor global</p>
          </div>

          {/* Card 3: Badges */}
          <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Badge Diperoleh</p>
                <h3 className="text-3xl font-mono font-bold text-white mt-2 glow-purple text-cyber-purple">
                  {user?.badges?.length || 0} <span className="text-xs text-gray-400 font-normal">earned</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-cyber-purple/5 border border-cyber-purple/20">
                <Award className="h-5 w-5 text-cyber-purple" />
              </div>
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-3">Lencana keahlian siber khusus</p>
          </div>

          {/* Card 4: Progress */}
          <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">Tantangan CTF</p>
                <h3 className="text-3xl font-mono font-bold text-white mt-2">
                  {solvedChallenges} <span className="text-xs text-gray-400 font-normal">/ {totalChallenges} solved</span>
                </h3>
              </div>
              <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-950 rounded-full h-1.5 mt-4 border border-zinc-900">
              <div
                className="bg-cyber-green h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${totalChallenges > 0 ? (solvedChallenges / totalChallenges) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Columns (Stats, Recommended Challenges) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Custom SVG Performance Chart */}
            <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
              <h2 className="font-mono text-base font-bold text-white mb-6 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-cyber-green" />
                Vulnerability Breakdown Stats
              </h2>
              
              <div className="space-y-4 font-mono text-xs">
                {/* Web Exploitation */}
                <div>
                  <div className="flex justify-between text-gray-400 mb-1.5">
                    <span>Web Exploitation</span>
                    <span>{webSolved} / {webTotal} solved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-950 border border-zinc-900 h-4 rounded overflow-hidden">
                      <div
                        className="bg-cyber-green h-full rounded transition-all"
                        style={{ width: `${webTotal > 0 ? (webSolved / webTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right font-bold text-cyber-green">
                      {webTotal > 0 ? Math.round((webSolved / webTotal) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Cryptography */}
                <div>
                  <div className="flex justify-between text-gray-400 mb-1.5">
                    <span>Cryptography</span>
                    <span>{cryptoSolved} / {cryptoTotal} solved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-950 border border-zinc-900 h-4 rounded overflow-hidden">
                      <div
                        className="bg-cyber-blue h-full rounded transition-all"
                        style={{ width: `${cryptoTotal > 0 ? (cryptoSolved / cryptoTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right font-bold text-cyber-blue">
                      {cryptoTotal > 0 ? Math.round((cryptoSolved / cryptoTotal) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Miscellaneous / Forensics */}
                <div>
                  <div className="flex justify-between text-gray-400 mb-1.5">
                    <span>Forensics, OSINT, & Misc</span>
                    <span>{miscSolved} / {miscTotal} solved</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-zinc-950 border border-zinc-900 h-4 rounded overflow-hidden">
                      <div
                        className="bg-cyber-purple h-full rounded transition-all"
                        style={{ width: `${miscTotal > 0 ? (miscSolved / miscTotal) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right font-bold text-cyber-purple">
                      {miscTotal > 0 ? Math.round((miscSolved / miscTotal) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Challenges */}
            <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
              <h2 className="font-mono text-base font-bold text-white mb-4 flex items-center gap-2">
                <Target className="h-4 w-4 text-cyber-blue" />
                Recommended Challenges
              </h2>
              {recommendedChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendedChallenges.map((ch) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-lg bg-zinc-950 border border-zinc-900 flex justify-between items-center group hover:border-cyber-green/35 transition-all"
                    >
                      <div>
                        <div className="font-mono text-sm font-bold text-white group-hover:text-cyber-green transition-colors">
                          {ch.title}
                        </div>
                        <div className="flex gap-2 items-center mt-1.5 text-[10px] font-mono">
                          <span className="text-purple-400 uppercase">{ch.category}</span>
                          <span className="text-zinc-600">•</span>
                          <span className={`uppercase font-bold ${
                            ch.difficulty === 'EASY' ? 'text-cyber-green' : ch.difficulty === 'MEDIUM' ? 'text-amber-500' : 'text-cyber-red'
                          }`}>
                            {ch.difficulty}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/challenges?id=${ch.id}`}
                        className="p-1.5 rounded bg-purple-500/10 border border-purple-500/25 text-purple-400 group-hover:bg-cyber-green/10 group-hover:border-cyber-green/30 group-hover:text-cyber-green transition-all"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg text-xs font-mono text-gray-500">
                  <CheckCircle2 className="h-6 w-6 text-cyber-green mx-auto mb-2 animate-bounce" />
                  Semua tantangan telah diselesaikan! Bagus sekali, agen.
                </div>
              )}
            </div>
          </div>

          {/* Right Columns (Badges, Challenge Generator) */}
          <div className="space-y-6">
            {/* Challenge Generator authoring banner */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-950/40 to-cyber-bg border border-purple-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-cyber-green/5 blur-xl"></div>
              <div>
                <div className="p-2.5 rounded-lg bg-cyber-purple/10 border border-cyber-purple/20 inline-block mb-3.5">
                  <Sparkles className="h-5 w-5 text-cyber-purple glow-purple" />
                </div>
                <h3 className="font-mono text-base font-bold text-white mb-1.5">Challenge Authoring</h3>
                <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4">
                  Ingin berlatih membuat soal atau menguji pengetahuan? Generate draf soal CTF baru
                  dan minta Admin mereviewnya untuk dipublikasikan secara live!
                </p>
              </div>
              <Link
                href="/challenges?tab=generator"
                className="w-full text-center py-2 rounded bg-cyber-purple/15 hover:bg-cyber-purple/25 text-cyber-purple border border-cyber-purple/40 font-mono text-xs font-bold transition-all cursor-pointer glow-purple"
              >
                Mulai Inisiatif Forge
              </Link>
            </div>

            {/* Recent Badges */}
            <div className="cyber-panel p-6 rounded-xl border border-purple-500/15">
              <h2 className="font-mono text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="h-4 w-4 text-cyber-purple" />
                Recent Badges
              </h2>
              {user?.badges && user.badges.length > 0 ? (
                <div className="space-y-3">
                  {user.badges.slice(0, 3).map((ub) => (
                    <div
                      key={ub.id}
                      className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-900 flex items-center gap-3"
                    >
                      <span className="text-2xl" title={ub.badge.name}>
                        {ub.badge.iconUrl}
                      </span>
                      <div>
                        <div className="font-mono text-xs font-bold text-white">{ub.badge.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{ub.badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-zinc-800 rounded-lg text-xs font-mono text-gray-500">
                  Belum ada badge diperoleh. Selesaikan Course atau Challenge pertama Anda!
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
