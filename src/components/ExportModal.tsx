import React from 'react';
import { Download, X, Laptop, Sparkles, FolderDown, Terminal, CheckCircle2 } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDirectDownload = () => {
    window.location.href = '/api/download-zip';
  };

  return (
    <div
      id="export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="export-modal-container"
        className="relative w-full max-w-lg bg-[#0b0d18] border border-purple-500/20 rounded-2xl p-6 shadow-2xl shadow-purple-900/30 text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />

        {/* Close button */}
        <button
          id="close-export-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-pink-400">
            <FolderDown className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Download Project ZIP
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
                PC & Mac
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              কম্পিউটারে Anisa AI Assistant চালানোর জন্য ZIP ফাইলটি ডাউনলোড করুন
            </p>
          </div>
        </div>

        {/* Action 1: Direct In-App ZIP Download Button */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-purple-200">
                পদ্ধতি ১: ওয়ান-ক্লিক সরাসরি ডাউনলোড (Direct Download)
              </p>
              <p className="text-xs text-slate-400">
                ক্লিক করলেই সম্পূর্ণ প্রজেক্ট সহ `setup.bat` এবং `start.bat` জিপ ডাউনলোড হবে।
              </p>
            </div>
          </div>
          <button
            id="modal-direct-download-btn"
            onClick={handleDirectDownload}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all duration-200 cursor-pointer active:scale-98"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>Download anisa-ai-assistant.zip</span>
          </button>
        </div>

        {/* Action 2: AI Studio Official Export */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-5">
          <p className="text-sm font-semibold text-slate-200 mb-1">
            পদ্ধতি ২: Google AI Studio মেনু থেকে ডাউনলোড (Export as ZIP)
          </p>
          <div className="space-y-1.5 text-xs text-slate-300 mt-2">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-[10px] font-bold mt-0.5">
                ১
              </span>
              <span>
                স্ক্রিনের উপরে ডান পাশের <strong>Settings</strong> (⚙️ গিয়ার আইকন) অথবা <strong>Export</strong> অপশনে ক্লিক করুন।
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center text-[10px] font-bold mt-0.5">
                ২
              </span>
              <span>
                ড্রপডাউন তালিকা থেকে <strong>"Export as ZIP"</strong> অপশনটিতে ক্লিক করলেই ডাউনলোড শুরু হবে।
              </span>
            </div>
          </div>
        </div>

        {/* Setup Steps Summary */}
        <div className="bg-[#0e101c] p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-pink-400" />
            ডাউনলোড করার পর কম্পিউটারে চালু করার ধাপ:
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-400 pl-1">
            <li>ZIP ফাইলটি Unzip / Extract করুন।</li>
            <li><strong>`setup.bat`</strong> ফাইলে ডাবল ক্লিক করুন।</li>
            <li>`.env` ফাইলে আপনার Gemini API Key দিয়ে <strong>`start.bat`</strong> চালু করুন!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
