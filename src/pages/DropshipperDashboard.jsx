import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import DirectoryModal from '../components/DirectoryModal';
import { Building2, Store, Tag, Brain, Sparkles, Check, Loader2, AlertCircle, X } from 'lucide-react';

const DropshipperDashboard = () => {
  const { token, user, setUser } = useAuth();

  // Intent state
  const [intent, setIntent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    rawIntentText: ''
  });

  // Matches state
  const [matches, setMatches] = useState([]);
  const [hasIntent, setHasIntent] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState(false);
  // Loaders & Errors
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAutoFill, setLoadingAutoFill] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Directory state
  const [directoryData, setDirectoryData] = useState({ counts: { shops: 0, dropshippers: 0 }, shops: [], dropshippers: [] });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('shop');

  const fetchDirectory = async () => {
    try {
      const res = await fetch('/api/matches/directory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDirectoryData(data);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    }
  };

  // Fetch intent and matches
  const fetchData = async () => {
    setLoadingIntent(true);
    setError('');
    try {
      const resIntent = await fetch('/api/dropshipper/intent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resIntent.ok) {
        const data = await resIntent.json();
        if (data) {
          setIntent(data);
          setFormData({
            userName: user?.name || '',
            rawIntentText: data.rawIntentText
          });
          setHasIntent(true);
          // Fetch matches since intent exists
          fetchMatches();
        } else {
          setFormData(prev => ({ ...prev, userName: user?.name || '' }));
          setIsEditing(true); // Default to editing if no intent exists
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch sourcing intent details');
    } finally {
      setLoadingIntent(false);
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const resMatches = await fetch('/api/dropshipper/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMatches.ok) {
        const data = await resMatches.json();
        setMatches(data.matches || []);
        setHasIntent(data.hasIntent);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleAutoFill = async () => {
    setLoadingAutoFill(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/ai/generate-mock-data?role=dropshipper', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to auto-fill form');
      }
      setFormData(prev => ({
        ...prev,
        rawIntentText: data.rawIntentText
      }));
      setSuccessMsg('Form filled with mock B2B dropshipper intent data! Click "Generate AI Profile" to publish.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred during auto-fill');
    } finally {
      setLoadingAutoFill(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
      fetchDirectory();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const res = await fetch('/api/dropshipper/intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save sourcing intent');
      }

      setIntent(data);
      setHasIntent(true);
      setIsEditing(false);
      setSuccessMsg('Sourcing intent saved! AI successfully generated search categories & tags.');
      setUser(prev => ({ ...prev, name: formData.userName }));
      fetchMatches(); // Reload matches
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving intent');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
      {/* Page Title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans text-gradient">
            {user?.name ? `${user.name}'s Dropshipper Dashboard` : 'Dropshipper Dashboard'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Specify the products you are sourcing, evaluate automatic AI tags, and discover matching suppliers.
          </p>
        </div>
      </div>

      {/* Interactive Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => { setModalType('shop'); setModalOpen(true); }}
          className="glass-panel glass-panel-hover p-6 rounded-2xl cursor-pointer relative overflow-hidden flex items-center justify-between group border border-slate-200 dark:border-slate-800/85 hover:border-indigo-500/25"
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">Active Suppliers</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {directoryData.counts.shops}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
              Registered suppliers in network. Click to view directory.
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
            <Store className="h-6 w-6" />
          </div>
        </div>

        <div 
          onClick={() => { setModalType('dropshipper'); setModalOpen(true); }}
          className="glass-panel glass-panel-hover p-6 rounded-2xl cursor-pointer relative overflow-hidden flex items-center justify-between group border border-slate-200 dark:border-slate-800/85 hover:border-sky-500/25"
        >
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-sky-600 dark:text-sky-400">Sourcing Agents</span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {directoryData.counts.dropshippers}
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-1">
               Active dropshipper profiles. Click to view sourcing intents.
            </span>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm flex items-center gap-2.5 mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto shrink-0 rounded-lg p-1 hover:bg-rose-500/20 transition-colors cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 text-sm flex items-center gap-2.5 mb-6">
          <Check className="h-5 w-5 shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button
            type="button"
            onClick={() => setSuccessMsg(null)}
            className="ml-auto shrink-0 rounded-lg p-1 hover:bg-emerald-500/20 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* Profile Card — TOP, full width */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-sky-500/10 pointer-events-none">
            <Building2 className="h-20 w-20" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            Sourcing Intent
          </h3>

          {loadingIntent ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={loadingAutoFill}
                  className="inline-flex items-center gap-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-500/20 hover:border-sky-500/40 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  {loadingAutoFill ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-500 dark:text-sky-400" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      AI Auto-Fill Intent
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Agent Full Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="e.g. Tyler Durden"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Describe Sourcing Intent / Markets
                  </label>
                  <textarea
                    name="rawIntentText"
                    required
                    rows={4}
                    value={formData.rawIntentText}
                    onChange={handleChange}
                    placeholder="e.g. I want to source minimalist steel water bottles, organic bamboo travel accessories..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none resize-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    AI will analyze your description to map high-level catalog matching variables automatically.
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-sky-800 text-white px-6 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  {saving ? (
                    <><Loader2 className="h-3 w-3 animate-spin" />AI Parsing...</>
                  ) : (
                    <><Brain className="h-3.5 w-3.5" />Generate AI Profile</>
                  )}
                </button>
                {intent && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">Your Sourcing Query</span>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{intent.rawIntentText}</p>
              </div>
              <div className="flex-1 min-w-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2">Intent Categories</span>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {intent.categories.map((cat, idx) => (
                    <span key={idx} className="rounded-md bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-600 dark:text-sky-300 border border-sky-500/10">{cat}</span>
                  ))}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2">Search Tags</span>
                <div className="flex flex-wrap gap-1.5">
                  {intent.tags.map((tag, idx) => (
                    <span key={idx} className="rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="h-3 w-3 text-sky-500 dark:text-sky-400" />{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-start">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:text-white px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  Edit Sourcing Input
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Matches Feed — BELOW the profile */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            Matching Shops
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
            Ranked dynamically by tag alignment against suppliers product catalogs.
          </p>
          {loadingMatches ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-sky-500 mb-2" />
              <span className="text-xs text-slate-500">Recalculating tag overlaps...</span>
            </div>
          ) : !hasIntent ? (
            <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-950/10">
              <Brain className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm">Sourcing Intent Not Set</h4>
              <p className="text-slate-500 dark:text-slate-500 text-xs mt-1 max-w-sm">Write down what products you wish to sell, and we will automatically list matches here.</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-950/10">
              <Sparkles className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
              <h4 className="text-slate-900 dark:text-white font-semibold text-sm">No Matches Yet</h4>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">We couldn't find any registered shops matching your sourcing intent. Try updating your sourcing text with more keywords!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.slice(0, expandedMatches ? matches.length : 3).map((m) => (
                  <MatchCard key={m.id} match={m} type="shop" />
                ))}
              </div>
              {matches.length > 3 && (
                <div className="flex justify-center mt-6">
                  <button
                    type="button"
                    onClick={() => setExpandedMatches(prev => !prev)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-6 py-2 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    {expandedMatches ? '▲ See Less' : `▼ See More (${matches.length - 3} more)`}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Directory Modal list */}
      <DirectoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        data={modalType === 'shop' ? directoryData.shops : directoryData.dropshippers}
      />
    </main>
  );
};

export default DropshipperDashboard;
