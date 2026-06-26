import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Compass, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const [email, setEmail] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = (e) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/auth?email=${encodeURIComponent(email.trim())}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-[120px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 z-10">
        
        {/* Sparkle Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>AI-Powered B2B Matchmaking</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-center font-extrabold tracking-tight text-slate-100 font-sans text-4xl sm:text-6xl md:text-7xl max-w-5xl leading-[1.1] mb-6">
          The future of <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400 bg-clip-text text-gradient-purple-blue">dropshipping</span> happens together
        </h1>

        {/* Hero Subtitle */}
        <p className="text-center text-slate-400 text-base sm:text-xl max-w-3xl leading-relaxed mb-10">
          Tools and trends evolve, but collaboration endures. With DropMatch, retail suppliers, custom brands, and active dropshippers come together on one intelligent direct-matching platform.
        </p>

        {/* Call to Action Form */}
        {user ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to={user.role === 'shop' ? '/shop' : '/dropshipper'}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
            >
              <span>Go to Your Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleGetStarted} className="w-full max-w-lg flex flex-col sm:flex-row items-stretch gap-3 mb-16">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-5 py-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 outline-none transition-all text-base"
            />
            <button
              type="submit"
              className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-lg shadow-indigo-600/10"
            >
              <span>Sign up for DropMatch</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8 border-t border-slate-900 pt-16">
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Instant Match Overlap</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We score every connection automatically based on category alignments and product tags so you know your highest matches instantly.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Intelligent AI Indexing</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Describe your shop or catalog in natural text and let Groq AI build your taxonomies, tags, and custom metadata templates.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Direct Partnerships</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              No middleman or checkout fees. Browse full listings, examine overlaps, and connect with direct messaging setups.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
