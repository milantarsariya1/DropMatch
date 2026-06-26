import React from 'react';
import { Zap, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800/60 bg-white/70 dark:bg-black/30 backdrop-blur-md">
      {/* Main footer grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">

          {/* Brand column — left */}
          <div className="max-w-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 shadow-md shadow-indigo-500/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                DropMatch
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-powered B2B discovery platform that intelligently connects suppliers with the right dropshippers — automatically.
            </p>
          </div>

          {/* Right columns */}
          <div className="flex flex-col sm:flex-row gap-12">

          {/* How it works column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">How it Works</h4>
            <ul className="space-y-2.5">
              {[
                'AI Tag Matching Engine',
                'Supplier Discovery',
                'Intent Parsing',
                'Category Alignment',
                'Match Score Ranking',
              ].map((item) => (
                <li key={item}>
                  <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-500">
                    <span className="h-1 w-1 rounded-full bg-indigo-400 dark:bg-indigo-600 flex-shrink-0" />
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Info column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Legal</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Changelog', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  >
                    {label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>

            {/* Live status badge */}
            <div className="flex items-center gap-2 pt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">All systems operational</span>
            </div>
          </div>

          </div> {/* end right columns */}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-100 dark:border-slate-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {year} DropMatch · B2B Dropshipper Discovery & Analytics Platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
