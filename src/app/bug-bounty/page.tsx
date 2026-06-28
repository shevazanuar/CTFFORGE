'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { FileText, Shield, Award, Terminal, ChevronRight, Play, ClipboardCheck } from 'lucide-react';

interface Program {
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
  vulnerabilityType: string;
  severity: string;
  status: string;
  pointAwarded: number;
  createdAt: string;
  stepsToReproduce: string;
  impact: string;
  evidence: string;
  evidenceUrl: string | null;
  program: {
    title: string;
  };
}

export default function BugBountyPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [reports, setReports] = useState<BugReport[]>([]);
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  
  const [activeSubTab, setActiveSubTab] = useState<'programs' | 'reports'>('programs');
  const [labOpen, setLabOpen] = useState(false);
  const [filingReport, setFilingReport] = useState(false);
  const [loading, setLoading] = useState(true);

  // File Report form fields
  const [reportTitle, setReportTitle] = useState('');
  const [vulnType, setVulnType] = useState('BAC');
  const [severity, setSeverity] = useState('HIGH');
  const [steps, setSteps] = useState('');
  const [impact, setImpact] = useState('');
  const [evidence, setEvidence] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // E-Commerce Lab states
  const [couponCode, setCouponCode] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [labPointsLog, setLabPointsLog] = useState<string[]>([]);

  // Bank API Lab states
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('100');
  const [bankBalance, setBankBalance] = useState(1000);
  const [bankLog, setBankLog] = useState<string[]>(['Sistem Bank Aktif. Saldo Awal: Rp 1.000.000']);

  // Cloud Storage (CyberDrive) Lab states
  const [cyberDriveFilePath, setCyberDriveFilePath] = useState('avatar.png');
  const [cyberDriveLog, setCyberDriveLog] = useState<string[]>(['Sistem CyberDrive Aktif. Direktori: /var/www/html/public']);

  // Copy state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const fetchProgramsAndReports = useCallback(async () => {
    try {
      const progRes = await fetch('/api/bug-bounty');
      if (progRes.ok) {
        const progData = await progRes.json();
        setPrograms(progData.programs);
      }

      const repRes = await fetch('/api/bug-bounty/reports');
      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData.reports);
      }
    } catch (err) {
      console.error('Error fetching bug bounty data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadBugBountyData() {
      await fetchProgramsAndReports();
    }

    loadBugBountyData();
  }, [fetchProgramsAndReports]);

  const handleSelectProgram = (p: Program) => {
    setSelectedProgram(p);
    setSelectedReport(null);
    setLabOpen(false);
    setFilingReport(false);
    
    // Reset lab states
    setCouponCode('');
    setItemQuantity(1);
    setLabPointsLog([]);
    
    setTransferTarget('');
    setTransferAmount('100');
    setBankBalance(1000);
    setBankLog(['Sistem Bank Aktif. Saldo Awal: Rp 1.000.000']);

    setCyberDriveFilePath('avatar.png');
    setCyberDriveLog(['Sistem CyberDrive Aktif. Direktori: /var/www/html/public']);
    setEvidence('');
  };

  const handleFileReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setSubmittingReport(true);

    try {
      const res = await fetch('/api/bug-bounty/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: selectedProgram.id,
          title: reportTitle,
          vulnerabilityType: vulnType,
          severity,
          stepsToReproduce: steps,
          impact,
          evidence,
          evidenceUrl,
        }),
      });

      if (res.ok) {
        alert('Laporan berhasil dikirim! Silakan periksa antrean di tab Laporan Saya.');
        
        // Reset form
        setReportTitle('');
        setSteps('');
        setImpact('');
        setEvidence('');
        setEvidenceUrl('');
        setFilingReport(false);

        // Refresh reports
        fetchProgramsAndReports();
        setActiveSubTab('reports');
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal mengirim laporan.');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // E-Commerce Coupon exploit logic
  const handleCyberShopCheckout = () => {
    const logs = [];
    const itemPrice = 100000;
    
    let total = itemPrice * itemQuantity;
    logs.push(`Memproses checkout ${itemQuantity}x Neural Link Processor...`);
    logs.push(`Subtotal: Rp ${(itemPrice * itemQuantity).toLocaleString('id-ID')}`);

    if (couponCode.toUpperCase() === 'CUSTOM-DISC') {
      logs.push('Kupon CUSTOM-DISC diterapkan.');
      logs.push('Vulnerability Triggered: Client-controlled coupon parameter parameter bypass.');
      total = total - 150000; // negative checkout
    }

    logs.push(`Total Tagihan Akhir: Rp ${total.toLocaleString('id-ID')}`);

    if (total < 0) {
      logs.push('CHECKOUT SUKSES! Saldo dompet Anda BERTAMBAH karena nilai transaksi negatif.');
      const evidenceCode = 'EVIDENCE-CYBERSHOP-BAC-NEG-COUPON';
      setEvidence(evidenceCode); // prefill evidence field
      logs.push(`EVIDENCE CODE FOUND: ${evidenceCode}`);
    } else {
      logs.push('Checkout Sukses! Pembayaran berhasil didebit.');
    }

    setLabPointsLog(logs);
  };

  // Bank API Transfer exploit logic
  const handleBankTransfer = () => {
    const logs = [...bankLog];
    const amount = parseInt(transferAmount);

    if (isNaN(amount) || amount <= 0) {
      logs.push('Error: Jumlah transfer harus lebih dari 0.');
      setBankLog(logs);
      return;
    }

    logs.push(`POST /api/v1/transfer HTTP/1.1`);
    logs.push(`Host: api.cybertrust.local`);
    logs.push(`Content-Type: application/json`);
    logs.push(`Payload: {"recipient": "${transferTarget}", "amount": ${amount}}`);

    // Exploit check: if target is "attacker" or if they send a negative amount!
    // Wait, in bank transfer, if they transfer a NEGATIVE amount:
    // e.g. amount = -500. Attacker transfers -500 to UserB.
    // attacker balance = balance - (-500) = balance + 500!
    // This is a classic integer underflow / parameter validation vulnerability.
    if (transferAmount.startsWith('-')) {
      const negAmount = Math.abs(amount);
      const newBal = bankBalance + negAmount;
      setBankBalance(newBal);
      logs.push(`Vulnerability Triggered: Negative value transfer parameter injection.`);
      logs.push(`Transfer Berhasil! Saldo didebit: ${amount} (Penambahan dana terdeteksi).`);
      logs.push(`Saldo Baru Anda: Rp ${(newBal * 1000).toLocaleString('id-ID')}`);
      
      const evidenceCode = 'EVIDENCE-BANKAPI-NEG-TRANSFER-ID';
      setEvidence(evidenceCode); // prefill evidence field
      logs.push(`EVIDENCE CODE FOUND: ${evidenceCode}`);
    } else {
      const newBal = bankBalance - amount;
      if (newBal < 0) {
        logs.push(`Error: Saldo tidak mencukupi untuk melakukan transfer.`);
      } else {
        setBankBalance(newBal);
        logs.push(`Transfer Rp ${(amount * 1000).toLocaleString('id-ID')} ke ${transferTarget} berhasil.`);
        logs.push(`Saldo Baru: Rp ${(newBal * 1000).toLocaleString('id-ID')}`);
      }
    }

    setBankLog(logs);
  };

  // Cloud Storage Fetch Path Traversal lab logic
  const handleCyberDriveFetch = () => {
    const logs = [...cyberDriveLog];
    const path = cyberDriveFilePath.trim();

    logs.push(`GET /api/v1/files/download?path=${path} HTTP/1.1`);
    logs.push(`Host: api.cyberdrive.local`);

    const hasPathTraversal = path.includes('..') && (path.includes('/') || path.includes('\\'));

    if (hasPathTraversal) {
      logs.push(`Vulnerability Triggered: Path Traversal / Directory Traversal.`);
      logs.push(`Membaca file di luar root directory...`);
      logs.push(`Sukses membaca file /etc/passwd:`);
      logs.push(`root:x:0:0:root:/root:/bin/bash`);
      logs.push(`bin:x:1:1:bin:/bin:/sbin/nologin`);
      logs.push(`flag:x:1001:1001:CTF{path_traversal_cloud_storage_secret}::/home/flag:/bin/bash`);
      
      const evidenceCode = 'EVIDENCE-CYBERDRIVE-PATH-TRAVERSAL';
      setEvidence(evidenceCode); // prefill evidence field
      logs.push(`EVIDENCE CODE FOUND: ${evidenceCode}`);
    } else if (path === 'avatar.png' || path === 'index.html' || path === 'style.css') {
      logs.push(`Membaca berkas public: ${path}`);
      logs.push(`[Binary Data / Text Content of ${path}]`);
      logs.push(`Membaca berkas selesai.`);
    } else {
      logs.push(`Error: Berkas '${path}' tidak ditemukan di direktori public.`);
    }

    setCyberDriveLog(logs);
  };

  return (
    <div className="min-h-screen bg-cyber-bg text-gray-200 flex flex-col scanline cyber-grid pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-1 flex flex-col">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white flex items-center gap-2">
              <FileText className="h-7 w-7 text-cyber-red glow-red" />
              Bug Bounty Simulator
            </h1>
            <p className="text-sm text-gray-400 mt-1.5 font-mono">
              Audit kode program sandbox, temukan vulnerability, peroleh bukti exploit, dan kirimkan laporan profesional.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-900 mb-8 font-mono text-sm gap-2">
          <button
            onClick={() => setActiveSubTab('programs')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'programs'
                ? 'border-cyber-red text-cyber-red glow-red'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Shield className="h-4 w-4" />
            Daftar Program Simulator
          </button>
          <button
            onClick={() => setActiveSubTab('reports')}
            className={`pb-3 px-4 border-b-2 font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'reports'
                ? 'border-cyber-purple text-cyber-purple glow-purple'
                : 'border-transparent text-gray-500 hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            Laporan Saya ({reports.length})
          </button>
        </div>

        {/* TAB 1: PROGRAMS */}
        {activeSubTab === 'programs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            
            {/* LEFT COLUMN: Program List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[60vh] overflow-y-auto space-y-2">
                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyber-red"></div>
                  </div>
                ) : programs.length > 0 ? (
                  programs.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProgram(p)}
                      className={`w-full text-left p-4 rounded-lg border font-mono transition-all flex justify-between items-center ${
                        selectedProgram?.id === p.id
                          ? 'bg-purple-500/10 text-cyber-red border-purple-500/35 glow-red'
                          : 'bg-zinc-950/30 text-gray-400 hover:text-white border-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">{p.title}</div>
                        <div className="text-[10px] text-gray-500 mt-1 uppercase">Max Reward: {p.rewardPoint} pts</div>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-500">Belum ada program bug bounty.</div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Program Scope details & Interactive Labs (7 cols) */}
            <div className="lg:col-span-7">
              {selectedProgram ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-6">
                  
                  {/* Title & Reward points */}
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                    <div>
                      <h2 className="font-mono text-lg font-bold text-white">{selectedProgram.title}</h2>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">Reward Potensial: <span className="text-cyber-green font-bold">+{selectedProgram.rewardPoint} Poin Reputasi</span></p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono text-cyber-red font-bold bg-cyber-red/10 px-2.5 py-1 rounded border border-cyber-red/20 animate-pulse">
                      <Terminal className="h-3.5 w-3.5" />
                      LIVE SCOPE
                    </span>
                  </div>

                  {/* Scopes & Out-of-scope details */}
                  <div className="space-y-4 font-mono text-xs">
                    <div>
                      <div className="text-gray-500 text-[10px] mb-1">PROGRAM DESCRIPTION</div>
                      <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded text-gray-300 leading-relaxed">
                        {selectedProgram.description.split('\n').map((line, i) => (
                          <p key={i} className="my-1">{line}</p>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-cyber-green text-[10px] font-bold mb-1">ALLOWED IN-SCOPE TARGETS</div>
                        <pre className="p-3 bg-zinc-950/80 border border-zinc-900 text-gray-400 rounded leading-normal overflow-x-auto text-[10px]">
                          {selectedProgram.scope}
                        </pre>
                      </div>
                      <div>
                        <div className="text-cyber-red text-[10px] font-bold mb-1">OUT OF SCOPE (PROHIBITED)</div>
                        <pre className="p-3 bg-zinc-950/80 border border-zinc-900 text-gray-400 rounded leading-normal overflow-x-auto text-[10px]">
                          {selectedProgram.outOfScope}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* INTERACTIVE PLAYGROUND LAB */}
                  {labOpen ? (
                    <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-900 space-y-4 font-mono text-xs">
                      <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                        <span className="text-cyber-green font-bold flex items-center gap-1">
                          <Terminal className="h-4 w-4" />
                          SANDBOX PLAYGROUND ENVIRONMENT
                        </span>
                        <button
                          onClick={() => setLabOpen(false)}
                          className="text-[10px] text-cyber-red hover:underline"
                        >
                          Tutup Lab
                        </button>
                      </div>

                      {/* E-Commerce Sandbox Lab interface */}
                      {selectedProgram.title === 'E-Commerce Marketplace (CyberShop)' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-cyber-bg border border-zinc-800 rounded-lg">
                            <h4 className="font-bold text-white mb-2">CyberShop Checkout Panel</h4>
                            
                            {/* Product card info */}
                            <div className="flex justify-between items-center p-2.5 bg-zinc-950 rounded border border-zinc-900 mb-3">
                              <div>
                                <span className="font-bold text-white block">Neural Link Processor</span>
                                <span className="text-[10px] text-gray-500">Toko Elektronik Siber</span>
                              </div>
                              <span className="font-bold text-cyber-blue">Rp 100.000</span>
                            </div>

                            {/* Cart editor inputs */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Jumlah Item</label>
                                <input
                                  type="number"
                                  value={itemQuantity}
                                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-white"
                                  min={1}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Kode Kupon Diskon</label>
                                <input
                                  type="text"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  placeholder="e.g. DISCOUNT10"
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-white"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleCyberShopCheckout}
                              className="w-full py-2 bg-cyber-green text-cyber-bg font-bold rounded hover:bg-cyber-green-dim transition-all text-xs cursor-pointer"
                            >
                              Kirim Transaksi Checkout
                            </button>
                          </div>

                          {/* Terminal Output logs */}
                          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[10px] text-gray-400 space-y-1">
                            <div className="text-gray-600 border-b border-zinc-900 pb-1 mb-1">CONSOLE OUTPUT LOGS</div>
                            {labPointsLog.map((log, i) => (
                              <p key={i} className={log.includes('SUKSES') ? 'text-cyber-green font-bold' : log.includes('Vulnerability') ? 'text-cyber-purple font-bold' : ''}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bank API Sandbox Lab interface */}
                      {selectedProgram.title === 'CyberTrust Bank API Platform' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-cyber-bg border border-zinc-800 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-white">CyberTrust Bank Portal</span>
                              <span className="text-xs text-cyber-blue font-bold">Saldo: Rp {(bankBalance * 1000).toLocaleString('id-ID')}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Penerima Transfer</label>
                                  <input
                                  type="text"
                                  value={transferTarget}
                                  onChange={(e) => setTransferTarget(e.target.value)}
                                  placeholder="e.g. agent_b"
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Jumlah Dana (Ribu Rp)</label>
                                <input
                                  type="text"
                                  value={transferAmount}
                                  onChange={(e) => setTransferAmount(e.target.value)}
                                  placeholder="e.g. -500"
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-white"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleBankTransfer}
                              className="w-full py-2 bg-cyber-blue text-white font-bold rounded hover:bg-sky-700 transition-all text-xs cursor-pointer"
                            >
                              Kirim POST API Transfer Request
                            </button>
                          </div>

                          {/* Terminal Output logs */}
                          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[10px] text-gray-400 max-h-40 overflow-y-auto space-y-1">
                            <div className="text-gray-600 border-b border-zinc-900 pb-1 mb-1">API REQUEST & RESPONSE HEADER LOGS</div>
                            {bankLog.map((log, i) => (
                              <p key={i} className={log.includes('Dana') || log.includes('Berhasil') ? 'text-cyber-green font-bold' : log.includes('Vulnerability') ? 'text-cyber-purple font-bold' : ''}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cloud Storage API (CyberDrive) Sandbox Lab interface */}
                      {selectedProgram.title === 'Cloud Storage API (CyberDrive)' && (
                        <div className="space-y-4">
                          <div className="p-4 bg-cyber-bg border border-zinc-800 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-bold text-white">CyberDrive Cloud Storage Portal</span>
                              <span className="text-xs text-cyber-blue font-bold">Direktori Aktif: /var/www/html/public</span>
                            </div>

                            <div className="space-y-3 mb-3">
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-1">Nama / Jalur Berkas (File Path)</label>
                                <input
                                  type="text"
                                  value={cyberDriveFilePath}
                                  onChange={(e) => setCyberDriveFilePath(e.target.value)}
                                  placeholder="e.g. avatar.png"
                                  className="w-full bg-zinc-950 border border-zinc-900 rounded p-1.5 text-white"
                                />
                              </div>
                            </div>

                            <button
                              onClick={handleCyberDriveFetch}
                              className="w-full py-2 bg-cyber-blue text-white font-bold rounded hover:bg-sky-700 transition-all text-xs cursor-pointer"
                            >
                              Kirim Permintaan Unduh File
                            </button>
                          </div>

                          {/* Terminal Output logs */}
                          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[10px] text-gray-400 max-h-40 overflow-y-auto space-y-1">
                            <div className="text-gray-600 border-b border-zinc-900 pb-1 mb-1">CONSOLE LOGS & HTTP REQUEST</div>
                            {cyberDriveLog.map((log, i) => (
                              <p key={i} className={log.includes('Sukses') || log.includes('flag') ? 'text-cyber-green font-bold' : log.includes('Vulnerability') ? 'text-cyber-purple font-bold' : ''}>
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence code copied alert */}
                      {evidence && (
                        <div className="p-2.5 bg-cyber-purple/10 border border-cyber-purple/35 text-cyber-purple rounded font-bold text-[10px] flex justify-between items-center select-all">
                          <span>Evidence Code: {evidence}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(evidence)}
                            className="text-[8px] text-cyber-purple hover:text-white bg-cyber-purple/10 hover:bg-cyber-purple/20 px-2 py-1 rounded border border-cyber-purple/30 uppercase cursor-pointer transition-all"
                          >
                            {copiedText === evidence ? 'Tersalin!' : 'Salin Bukti'}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLabOpen(true)}
                        className="flex-1 py-3 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-cyber-green/40 text-cyber-green font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-4 w-4 text-cyber-green fill-cyber-green" />
                        Jalankan Simulator Lab Aplikasi
                      </button>
                    </div>
                  )}

                  {/* FILE BUG REPORT FORM */}
                  {filingReport ? (
                    <form onSubmit={handleFileReportSubmit} className="space-y-4 border-t border-zinc-900 pt-6">
                      <div className="flex justify-between items-center">
                        <h3 className="font-mono text-sm font-bold text-white">Formulir Laporan Vulnerability</h3>
                        <button
                          type="button"
                          onClick={() => setFilingReport(false)}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Batal
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                        {/* Title */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-gray-500 block">Judul Laporan Temuan</label>
                          <input
                            type="text"
                            value={reportTitle}
                            onChange={(e) => setReportTitle(e.target.value)}
                            placeholder="e.g. Parameter tampering pada total tagihan checkout"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-red/40"
                            required
                          />
                        </div>

                        {/* Vulnerability type */}
                        <div className="space-y-1">
                          <label className="text-gray-500 block">Tipe Kerentanan</label>
                          <select
                            value={vulnType}
                            onChange={(e) => setVulnType(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-red/40"
                          >
                            <option value="BAC">Broken Access Control (BAC)</option>
                            <option value="SQLI">SQL Injection (SQLi)</option>
                            <option value="XSS">Cross-Site Scripting (XSS)</option>
                            <option value="IDOR">Insecure Direct Object Reference (IDOR)</option>
                            <option value="RCE">Remote Code Execution (RCE)</option>
                            <option value="OTHER">Vulnerability Lainnya</option>
                          </select>
                        </div>

                        {/* Severity */}
                        <div className="space-y-1">
                          <label className="text-gray-500 block">Tingkat Bahaya (Severity)</label>
                          <select
                            value={severity}
                            onChange={(e) => setSeverity(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white focus:border-cyber-red/40"
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>

                        {/* Steps to Reproduce */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-gray-500 block">Langkah Mereproduksi (Steps to Reproduce)</label>
                          <textarea
                            value={steps}
                            onChange={(e) => setSteps(e.target.value)}
                            placeholder="1. Pergi ke checkout... 2. Terapkan kupon... 3. Lihat total tagihan..."
                            rows={3}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-red/40 resize-none"
                            required
                          />
                        </div>

                        {/* Impact */}
                        <div className="md:col-span-2 space-y-1">
                          <label className="text-gray-500 block">Dampak Dampak Bahaya (Impact)</label>
                          <textarea
                            value={impact}
                            onChange={(e) => setImpact(e.target.value)}
                            placeholder="Penyerang dapat membeli barang secara gratis bahkan mendapatkan saldo dompet tambahan."
                            rows={2}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-red/40 resize-none"
                            required
                          />
                        </div>

                        {/* Evidence */}
                        <div className="space-y-1">
                          <label className="text-gray-500 block">Bukti Eksploitasi / Code (Evidence)</label>
                          <input
                            type="text"
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                            placeholder="Masukkan kode EVIDENCE-... hasil temuan lab"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-red/40"
                            required
                          />
                        </div>

                        {/* Evidence URL */}
                        <div className="space-y-1">
                          <label className="text-gray-500 block">Tautan Bukti Gambar (Optional)</label>
                          <input
                            type="text"
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                            placeholder="https://imgbb.local/bukti_exploit.png"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-white placeholder-gray-700 focus:border-cyber-red/40"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded bg-cyber-red text-white font-bold transition-all border border-cyber-red/40 hover:scale-[1.01] flex items-center justify-center gap-1.5 cursor-pointer glow-red"
                        disabled={submittingReport}
                      >
                        {submittingReport ? 'Mengirim Laporan...' : 'Kirim Laporan Vulnerability'}
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => setFilingReport(true)}
                      className="w-full py-3 rounded-lg bg-cyber-red/10 text-cyber-red font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-cyber-red/40 hover:scale-[1.01] cursor-pointer glow-red"
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Buat & Kirim Laporan Temuan Celah Baru
                    </button>
                  )}

                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-16">
                  Pilih program bug bounty simulator di panel kiri untuk mempelajari scope, menjalankan lab aplikasi, dan membuat laporan kerentanan.
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: REPORTS LIST */}
        {activeSubTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
            
            {/* LEFT COLUMN: Reports List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="cyber-panel p-4 rounded-xl border border-purple-500/15 max-h-[60vh] overflow-y-auto space-y-2">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`w-full text-left p-3.5 rounded-lg border font-mono transition-all flex justify-between items-center ${
                        selectedReport?.id === r.id
                          ? 'bg-purple-500/10 text-cyber-purple border-purple-500/35 glow-purple'
                          : 'bg-zinc-950/30 text-gray-400 hover:text-white border-zinc-900/60 hover:border-zinc-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs truncate max-w-[200px] sm:max-w-xs">{r.title}</div>
                        <div className="flex gap-2 items-center mt-1 text-[9px] text-gray-500">
                          <span className="text-cyber-red uppercase">{r.severity}</span>
                          <span>•</span>
                          <span className="text-gray-600 truncate max-w-[100px]">{r.program.title}</span>
                        </div>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        r.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        r.status === 'VALID' ? 'bg-cyber-green/10 text-cyber-green border border-cyber-green/20' :
                        'bg-cyber-red/10 text-cyber-red border border-cyber-red/20'
                      }`}>
                        {r.status}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-6 text-xs text-gray-500">Belum ada laporan dikirim.</div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Report Review / Detail Preview (7 cols) */}
            <div className="lg:col-span-7">
              {selectedReport ? (
                <div className="cyber-panel p-6 rounded-2xl border border-purple-500/15 space-y-6">
                  
                  {/* Title & Status */}
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
                    <div>
                      <h2 className="font-mono text-base font-bold text-white">{selectedReport.title}</h2>
                      <p className="text-[10px] font-mono text-gray-400 mt-1">Program: <span className="text-white font-bold">{selectedReport.program.title}</span></p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        selectedReport.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' :
                        selectedReport.status === 'VALID' ? 'bg-cyber-green/10 text-cyber-green border-cyber-green/20' :
                        'bg-cyber-red/10 text-cyber-red border-cyber-red/20'
                      }`}>
                        {selectedReport.status}
                      </span>
                      {selectedReport.pointAwarded > 0 && (
                        <div className="text-xs text-cyber-green font-mono font-bold mt-1.5 glow-green">+{selectedReport.pointAwarded} pts</div>
                      )}
                    </div>
                  </div>

                  {/* Report Body */}
                  <div className="space-y-4 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-2.5 bg-zinc-950 rounded border border-zinc-900">
                        <span className="text-gray-500 text-[10px] block mb-0.5">SEVERITY LEVEL</span>
                        <span className="text-cyber-red font-bold">{selectedReport.severity}</span>
                      </div>
                      <div className="p-2.5 bg-zinc-950 rounded border border-zinc-900">
                        <span className="text-gray-500 text-[10px] block mb-0.5">VULNERABILITY TYPE</span>
                        <span className="text-white font-bold">{selectedReport.vulnerabilityType}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-500 text-[10px] block mb-1">STEPS TO REPRODUCE</span>
                      <pre className="p-3 bg-zinc-950/80 border border-zinc-900 text-gray-300 rounded leading-relaxed text-[10px] whitespace-pre-wrap">
                        {selectedReport.stepsToReproduce}
                      </pre>
                    </div>

                    <div>
                      <span className="text-gray-500 text-[10px] block mb-1">IMPACT ANALYSIS</span>
                      <pre className="p-3 bg-zinc-950/80 border border-zinc-900 text-gray-300 rounded leading-relaxed text-[10px] whitespace-pre-wrap">
                        {selectedReport.impact}
                      </pre>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500 text-[10px] block mb-1">EVIDENCE FINDING CODE</span>
                        <div className="p-2.5 bg-zinc-950 rounded border border-zinc-900 text-cyber-purple font-bold">
                          {selectedReport.evidence}
                        </div>
                      </div>
                      {selectedReport.evidenceUrl && (
                        <div>
                          <span className="text-gray-500 text-[10px] block mb-1">EVIDENCE URL</span>
                          <div className="p-2.5 bg-zinc-950 rounded border border-zinc-900 text-gray-400 truncate">
                            {selectedReport.evidenceUrl}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="cyber-panel p-8 rounded-2xl border border-purple-500/15 text-center text-gray-500 font-mono text-xs py-16">
                  Pilih laporan Anda di panel sebelah kiri untuk menampilkan rincian detail laporan.
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
