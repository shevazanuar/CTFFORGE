'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Trophy, BookOpen, Target, FileText, Cpu, LogOut, LogIn, Award, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => pathname?.startsWith(path);

  const navLinks = [
    { href: '/courses', label: 'Learning Path', icon: BookOpen },
    { href: '/challenges', label: 'CTF Practice', icon: Target },
    { href: '/bug-bounty', label: 'Bug Bounty', icon: FileText },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-opacity-70 bg-cyber-bg border-b border-purple-500/15 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-10">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 group-hover:border-cyber-green/50 transition-all duration-300">
                <Shield className="h-6 w-6 text-purple-500 group-hover:text-cyber-green transition-colors duration-300 glow-purple" />
              </div>
              <span className="font-mono text-xl font-bold tracking-wider text-white">
                CTF<span className="text-cyber-green font-extrabold glow-green">FORGE</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation links */}
          {user && (
            <div className="hidden md:flex space-x-1 items-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-mono tracking-tight transition-all duration-200 ${
                      active
                        ? 'bg-purple-500/10 text-cyber-green border border-purple-500/30 glow-green'
                        : 'text-gray-400 hover:text-white hover:bg-zinc-900/60 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              
              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-mono transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30 glow-red'
                      : 'text-cyber-red/80 hover:text-white hover:bg-cyber-red/10 border border-transparent'
                  }`}
                >
                  <Cpu className="h-4 w-4" />
                  Admin Console
                </Link>
              )}
            </div>
          )}

          {/* Right actions (User status or Login button) */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Stats badge */}
                <div className="flex items-center gap-3.5 px-3 py-1 rounded-full bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-cyber-green">
                    <Trophy className="h-3.5 w-3.5" />
                    <span className="font-bold">{user.totalPoint} pts</span>
                  </div>
                  <div className="h-3 w-px bg-zinc-800"></div>
                  <div className="flex items-center gap-1 text-purple-400">
                    <Award className="h-3.5 w-3.5" />
                    <span>{user.badges?.length || 0} badges</span>
                  </div>
                </div>

                {/* Profile menu details */}
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-white">{user.name}</div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{user.role}</div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg bg-zinc-950 hover:bg-cyber-red/10 hover:text-cyber-red border border-zinc-800 hover:border-cyber-red/30 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-transparent text-sm font-mono text-gray-400 hover:text-white transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-sm font-mono text-white transition-all shadow-md shadow-purple-500/20 border border-purple-500/40"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-cyber-bg border-b border-purple-500/15 px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              {/* Mobile Stats display */}
              <div className="flex justify-between items-center p-3 mb-2 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-1.5 text-cyber-green">
                  <Trophy className="h-3.5 w-3.5" />
                  <span className="font-bold">{user.totalPoint} pts</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <Award className="h-3.5 w-3.5" />
                  <span>{user.badges?.length || 0} Badges</span>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</div>
              </div>

              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-mono ${
                      active
                        ? 'bg-purple-500/10 text-cyber-green border border-purple-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-mono ${
                    isActive('/admin')
                      ? 'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                      : 'text-cyber-red/80 hover:text-white hover:bg-cyber-red/10'
                  }`}
                >
                  <Cpu className="h-5 w-5" />
                  Admin Console
                </Link>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 mt-2 rounded-lg text-base font-mono text-cyber-red/80 hover:text-white hover:bg-cyber-red/10"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-sm font-mono text-gray-400 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-purple-600 text-sm font-mono text-white"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
