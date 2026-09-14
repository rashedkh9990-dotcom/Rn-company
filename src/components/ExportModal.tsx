import React from 'react';
import { Download, X, Laptop, Sparkles, FolderDown, Terminal, CheckCircle2, Cpu } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="export-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0b0d18] border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-900/30 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

        {/* Close button */}
        <button
          id="close-export-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-pink-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              PC Setup & Download Files
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                EXE & ZIP
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              আপনার উইন্ডোজ পিসিতে Anisa AI ইনস্টল ও রান করার ফাইলসমূহ
            </p>
          </div>
        </div>

        {/* Option 1: Windows EXE Setup File (USER REQUESTED) */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-pink-950/20 border border-purple-500/40 mb-4 shadow-lg shadow-purple-950/40">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold border border-pink-500/30">
                  Windows App (.EXE)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">43 KB</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                anisa-ai-assistant.exe
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                কম্পিউটারে সরাসরি ডাবল-ক্লিক করলেই Node.js চেক, সেটআপ ও ব্রাউজারে অটো লঞ্চ করবে।
              </p>
            </div>
          </div>
          <a
            id="download-exe-file-btn"
            href="/api/download-exe"
            download="anisa-ai-assistant.exe"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-all duration-200 cursor-pointer active:scale-98 no-underline"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Download anisa-ai-assistant.exe</span>
          </a>
        </div>

        {/* Option 2: Full Project ZIP Archive */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Full Project (.ZIP)
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">
                anisa-ai-assistant.zip
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                সম্পূর্ণ সোর্স কোড সহ `anisa-ai-assistant.exe`, `setup.bat` এবং `start.bat`।
              </p>
            </div>
          </div>
          <a
            id="modal-direct-download-btn"
            href="/api/download-zip"
            download="anisa-ai-assistant.zip"
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all duration-200 cursor-pointer active:scale-98 no-underline"
          >
            <FolderDown className="w-4 h-4" />
            <span>Download anisa-ai-assistant.zip</span>
          </a>
        </div>

        {/* Setup Steps Summary */}
        <div className="bg-[#0e101c] p-3.5 rounded-xl border border-white/10 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-pink-400" />
            কম্পিউটারে চালু করার সহজ নিয়ম:
          </p>
          <div className="space-y-1.5 text-slate-400 pl-1">
            <div className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">১.</span>
              <span><strong>anisa-ai-assistant.exe</strong> ফাইলটিতে ডাবল ক্লিক করুন।</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">২.</span>
              <span>যদি Node.js না থাকে, এটি ব্রাউজারে nodejs.org খুলে দেবে।</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-400 font-bold">৩.</span>
              <span>`.env` ফাইলটিতে আপনার <strong>GEMINI_API_KEY</strong> দিয়ে সেভ করে দিলেই ব্রাউজারে অনীসা চালু হয়ে যাবে!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
