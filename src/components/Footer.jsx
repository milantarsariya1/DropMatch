import React from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-black/30 backdrop-blur-md">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 shadow-md shadow-indigo-500/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              DropMatch
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
            AI-powered B2B discovery platform that intelligently connects suppliers with the right dropshippers — automatically.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {year} DropMatch · B2B Dropshipper Discovery & Analytics Platform
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Made by <span className="font-semibold text-slate-800 dark:text-slate-200">Milan Tarsariya</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
