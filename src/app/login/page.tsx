'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { refetchUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal.');
      }

      // Refetch user context data
      await refetchUser();
      
      // Redirect
      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Terjadi kesalahan.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col justify-center items-center px-4 scanline cyber-grid">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl -z-10"></div>
      
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
            <Shield className="h-8 w-8 text-purple-500 glow-purple" />
          </div>
          <span className="font-mono text-2xl font-bold tracking-wider text-white">
            CTF<span className="text-cyber-green glow-green">FORGE</span>
          </span>
        </Link>
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Cybersecurity Training Lab</p>
      </div>

      {/* Login Card */}
      <div className="cyber-panel p-8 rounded-2xl w-full max-w-md border border-purple-500/15">
        <h2 className="font-mono text-xl font-bold text-white mb-6 text-center tracking-wide">
          ACCESS <span className="text-cyber-green glow-green">PORTAL</span>
        </h2>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-cyber-red/10 border border-cyber-red/35 flex items-start gap-2.5 text-xs text-cyber-red font-mono">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-mono text-sm">
          {/* Email input */}
          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wider block">Security Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@ctfforge.com"
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-cyber-green/50 text-white placeholder-gray-600 transition-all text-sm ring-glow-green"
              required
              disabled={loading}
            />
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wider block">Access Key (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 focus:border-cyber-green/50 text-white placeholder-gray-600 transition-all text-sm pr-11 ring-glow-green"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all border border-purple-500/40 hover:border-cyber-green/50 shadow-md shadow-purple-500/10 flex items-center justify-center gap-2 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-cyber-green" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <span>Authenticate Portal</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs font-mono text-gray-500">
          Belum terdaftar?{' '}
          <Link href="/register" className="text-cyber-green hover:underline glow-green">
            Buat Akun Agen Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cyber-bg text-gray-200 flex justify-center items-center font-mono">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyber-green"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
