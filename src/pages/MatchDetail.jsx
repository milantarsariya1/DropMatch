import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Sparkles, MapPin, Tag, Mail, MessageSquare, Award, CheckCircle2, User, Send, Check, Loader2 } from 'lucide-react';

const MatchDetail = () => {
  const { matchId } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inquiry form states
  const [inquiryText, setInquiryText] = useState('');
  const [sentInquiry, setSentInquiry] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/matches/${matchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to fetch match details');
        }
        setDetail(data);
        // Pre-fill a template inquiry message
        const targetName = data.type === 'shop' ? data.shopName : data.ownerName;
        setInquiryText(
          `Hi ${targetName},\n\nI saw our profiles matched with a score of ${data.score} on DropMatch. I noticed we share categories like "${data.sharedCategories.join(', ')}" and tags like "${data.sharedTags.join(', ')}".\n\nI would love to explore a partnership to sell your products. Let me know if you are open to discussing further!\n\nBest,\n${user.name}`
        );
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not load match details.');
      } finally {
        setLoading(false);
      }
    };

    if (token && matchId) {
      fetchDetail();
    }
  }, [matchId, token, user]);

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setSending(true);
    // Simulate API delay
    setTimeout(() => {
      setSending(false);
      setSentInquiry(true);
    }, 1200);
  };

  const handleBack = () => {
    if (user.role === 'shop') {
      navigate('/shop');
    } else {
      navigate('/dropshipper');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-2" />
        <span className="text-xs text-slate-500 font-medium">Analyzing partnership alignment...</span>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 flex-1">
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 dark:text-rose-400 mx-auto mb-3" />
          <h4 className="text-slate-900 dark:text-white font-semibold text-lg">Error Loading Match</h4>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 mb-6">{error || 'Match details could not be resolved.'}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  // Score details
  const score = detail.score || 0;
  const ratingText = score >= 5 ? 'Exceptional Fit' : score >= 3 ? 'Strong Alignment' : 'Moderate Overlap';
  const ratingColor = score >= 5 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : score >= 3 ? 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20' : 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20';

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
      {/* Back button link */}
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white text-xs font-semibold mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Dashboard
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Alignment Gauge Panel (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col items-center text-center">
            
            {/* Giant score gauge */}
            <div className="relative flex items-center justify-center h-40 w-40 rounded-full border-4 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 mt-4 mb-6 shadow-inner">
              {/* Spinning gradient ring for exceptional scores */}
              {score >= 5 && (
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-500/35 animate-spin" style={{ animationDuration: '20s' }} />
              )}
              
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{score}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Tag Matches
                </span>
              </div>
            </div>

            <span className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold border tracking-wide ${ratingColor} mb-4`}>
              {ratingText}
            </span>

            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-[240px] mb-6">
              This score measures overlap weight. Categories count as <b className="text-slate-800 dark:text-white">2 points</b> and tags count as <b className="text-slate-800 dark:text-white">1 point</b>.
            </p>

            {/* Entity Quick Info */}
            <div className="w-full border-t border-slate-200 dark:border-slate-800/80 pt-5 text-left space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Entity Name
                </span>
                <span className="text-sm font-bold text-slate-950 dark:text-white">
                  {detail.type === 'shop' ? detail.shopName : detail.ownerName}
                </span>
              </div>

              {detail.location && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Location
                  </span>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    {detail.location}
                  </span>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Primary Contact
                </span>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
                  <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{detail.ownerName}</span>
                </span>
                <a 
                  href={`mailto:${detail.ownerEmail}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium flex items-center gap-1.5 mt-1 underline decoration-indigo-500/40 hover:decoration-indigo-400"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {detail.ownerEmail}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Panels (Right) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overlap Summary Card */}
          <div className="glass-panel rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400 pulse-glow" />
              AI Overlap Analysis
            </h3>

            {/* Shared Categories */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Overlapping Categories ({detail.sharedCategories.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.sharedCategories.map((cat, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-500/15"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Shared Tags */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Overlapping Search Tags ({detail.sharedTags.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.sharedTags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-300 border border-teal-500/15"
                  >
                    <Tag className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Full raw info comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  {detail.type === 'shop' ? 'Shop Description' : 'Dropshipper Query'}
                </h5>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-900">
                  {detail.type === 'shop' 
                    ? `"${detail.description}"` 
                    : `"${detail.rawIntentText}"`}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  Raw Keyword Inputs
                </h5>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-900">
                  {detail.type === 'shop' ? detail.rawProductText : detail.rawIntentText}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive partnership inquiry card */}
          <div className="glass-panel rounded-3xl p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Partnership Inquiry Sandbox
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              Review and send a collaborative inquiry draft. It simulates matching emails sent to their inbox.
            </p>

            {sentInquiry ? (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-8 text-center flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold text-base">Inquiry Dispatched Successfully!</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 max-w-sm">
                  We've simulated sending this inquiry draft directly to <b className="text-slate-800 dark:text-slate-200">{detail.ownerEmail}</b>. You can also reach out to them directly.
                </p>
                <button
                  onClick={() => setSentInquiry(false)}
                  className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-950/40 px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  Write Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                <div>
                  <textarea
                    required
                    rows={6}
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-3 text-xs font-mono leading-relaxed transition-all outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white px-5 py-3 text-xs font-semibold transition-all shadow-md shadow-indigo-950/20 cursor-pointer"
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Routing Email...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Send Partnership Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </main>
  );
};

export default MatchDetail;
