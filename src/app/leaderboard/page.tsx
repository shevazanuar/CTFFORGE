'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Trophy } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  totalPoint: number;
  badges: {
    badge: {
      name: string;
      iconUrl: string;
    };
  }[];
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.leaderboard || []);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-full inline-block mb-3.5">
            <Trophy className="h-8 w-8 text-cyber-green glow-green" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wide">
            GLOBAL SCOREBOARD
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-mono uppercase tracking-widest">
            Tempat berkumpulnya para peretas etis terbaik CTFForge
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyber-green"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top 3 Podium layout */}
            {users.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 items-end max-w-xl mx-auto mb-10 pt-4">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-mono font-bold text-cyber-blue mb-1">2nd Place</div>
                  <div className="w-full text-center p-4 bg-zinc-950/80 border border-cyber-blue/30 rounded-t-xl">
                    <span className="text-2xl">🥈</span>
                    <div className="font-mono text-xs font-bold text-white truncate max-w-[100px] mx-auto mt-2">
                      {users[1].name}
                    </div>
                    <div className="text-xs font-mono font-extrabold text-cyber-blue mt-1">
                      {users[1].totalPoint} pts
                    </div>
                  </div>
                  <div className="w-full h-12 bg-cyber-blue/15 border-t border-cyber-blue/20"></div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-mono font-bold text-cyber-green mb-1 animate-pulse">1st Place</div>
                  <div className="w-full text-center p-6 bg-purple-950/20 border-2 border-cyber-green/50 rounded-t-xl shadow-lg shadow-cyber-green/5 relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-cyber-green/10 blur-xl"></div>
                    <span className="text-3xl">🏆</span>
                    <div className="font-mono text-sm font-bold text-white truncate max-w-[120px] mx-auto mt-2">
                      {users[0].name}
                    </div>
                    <div className="text-sm font-mono font-extrabold text-cyber-green mt-1 glow-green">
                      {users[0].totalPoint} pts
                    </div>
                  </div>
                  <div className="w-full h-16 bg-cyber-green/20 border-t border-cyber-green/30"></div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="text-xs font-mono font-bold text-cyber-purple mb-1">3rd Place</div>
                  <div className="w-full text-center p-4 bg-zinc-950/80 border border-cyber-purple/30 rounded-t-xl">
                    <span className="text-2xl">🥉</span>
                    <div className="font-mono text-xs font-bold text-white truncate max-w-[100px] mx-auto mt-2">
                      {users[2].name}
                    </div>
                    <div className="text-xs font-mono font-extrabold text-cyber-purple mt-1">
                      {users[2].totalPoint} pts
                    </div>
                  </div>
                  <div className="w-full h-8 bg-cyber-purple/10 border-t border-cyber-purple/20"></div>
                </div>
              </div>
            )}

            {/* Scoreboard table */}
            <div className="cyber-panel rounded-2xl border border-purple-500/15 overflow-hidden">
              <table className="w-full font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-900 text-gray-500 text-left uppercase">
                    <th className="p-4 w-16 text-center">Rank</th>
                    <th className="p-4">Codename</th>
                    <th className="p-4 text-center">Badges</th>
                    <th className="p-4 text-right pr-6">Total Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {users.map((u, idx) => {
                    const isMe = currentUser?.id === u.id;
                    return (
                      <tr
                        key={u.id}
                        className={`transition-colors ${
                          isMe
                            ? 'bg-purple-500/5 text-cyber-green border-l-2 border-l-cyber-green'
                            : 'hover:bg-zinc-900/30'
                        }`}
                      >
                        {/* Rank */}
                        <td className="p-4 text-center font-bold">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </td>

                        {/* Name & Role */}
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.name}
                            {u.role === 'ADMIN' && (
                              <span className="px-1.5 py-0.2 rounded bg-cyber-red/10 text-cyber-red border border-cyber-red/20 text-[8px] font-normal tracking-wide uppercase">
                                Staff
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">AgentID: {u.id.slice(0, 8)}</div>
                        </td>

                        {/* Badges icons */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-1">
                            {u.badges && u.badges.length > 0 ? (
                              u.badges.map((ub, bIdx) => (
                                <span
                                  key={bIdx}
                                  title={ub.badge.name}
                                  className="text-base cursor-help select-none"
                                >
                                  {ub.badge.iconUrl}
                                </span>
                              ))
                            ) : (
                              <span className="text-[9px] text-gray-600 font-normal">No badges</span>
                            )}
                          </div>
                        </td>

                        {/* Points */}
                        <td className="p-4 text-right pr-6 font-bold text-sm text-cyber-green">
                          {u.totalPoint} <span className="text-[10px] text-gray-500 font-normal">pts</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
