import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MatchCard from '../components/MatchCard';
import DirectoryModal from '../components/DirectoryModal';
import { Store, Building2, MapPin, Tag, Brain, Sparkles, Check, Loader2, AlertCircle, X } from 'lucide-react';

const ShopDashboard = () => {
  const { token, user, setUser } = useAuth();
  
  // Listing state
  const [listing, setListing] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    shopName: '',
    location: '',
    rawProductText: ''
  });

  // Matches state
  const [matches, setMatches] = useState([]);
  const [hasListing, setHasListing] = useState(false);
  const [expandedMatches, setExpandedMatches] = useState(false);

  // Loaders & Errors
  const [loadingListing, setLoadingListing] = useState(true);
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

  // Fetch listing and matches
  const fetchData = async () => {
    setLoadingListing(true);
    setError('');
    try {
      const resListing = await fetch('/api/shop/listing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resListing.ok) {
        const data = await resListing.json();
        if (data) {
          setListing(data);
          setFormData({
            userName: user?.name || '',
            shopName: data.shopName,
            location: data.location,
            rawProductText: data.rawProductText
          });
          setHasListing(true);
          // Fetch matches since listing exists
          fetchMatches();
        } else {
          setFormData(prev => ({ ...prev, userName: user?.name || '' }));
          setIsEditing(true); // Default to editing if no listing exists
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch listing details');
    } finally {
      setLoadingListing(false);
    }
  };

  const fetchMatches = async () => {
    setLoadingMatches(true);
    try {
      const resMatches = await fetch('/api/shop/matches', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMatches.ok) {
        const data = await resMatches.json();
        setMatches(data.matches || []);
        setHasListing(data.hasListing);
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
      const res = await fetch('/api/ai/generate-mock-data?role=shop', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to auto-fill form');
      }
      setFormData(prev => ({
        ...prev,
        shopName: data.shopName,
        location: data.location,
        rawProductText: data.rawProductText
      }));
      setSuccessMsg('Form filled with mock B2B shop data! Click "Generate AI Listing" to publish.');
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
      const res = await fetch('/api/shop/listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save listing');
      }

      setListing(data);
      setHasListing(true);
      setIsEditing(false);
      setSuccessMsg('Profile updated! AI successfully analyzed your product line.');
      setUser(prev => ({ ...prev, name: formData.userName }));
      fetchMatches(); // Reload matches
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while saving profile');
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
            {user?.name ? `${user.name}'s Shop Dashboard` : 'Shop Dashboard'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Publish your inventory categories, describe what you offer, and discover match-made dropshippers.
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
        {/* Listing Profile — TOP */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-indigo-500/20">
              <Store className="h-16 w-16" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Listing Profile
            </h3>

            {loadingListing ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={loadingAutoFill}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 hover:border-indigo-500/40 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {loadingAutoFill ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500 dark:text-indigo-400" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        AI Auto-Fill Profile
                      </>
                    )}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Owner Full Name
                  </label>
                  <input
                    type="text"
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Connor"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    required
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Leather Craft"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Austin, TX"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Describe Products / Inventory
                  </label>
                  <textarea
                    name="rawProductText"
                    required
                    rows={6}
                    value={formData.rawProductText}
                    onChange={handleChange}
                    placeholder="e.g. Genuine leather wallets, vegetable-tanned wallets, minimalist phone covers, steel vacuum cups..."
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 px-4 py-2.5 text-sm transition-all outline-none resize-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    AI will automatically analyze this text to generate categories, tags, and marketing blurbs.
                  </span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white py-2.5 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        AI Parsing...
                      </>
                    ) : (
                      <>
                        <Brain className="h-3.5 w-3.5" />
                        Generate AI Listing
                      </>
                    )}
                  </button>
                  {listing && (
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 dark:hover:bg-slate-950/40 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{listing.shopName}</h4>
                  <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 text-xs">
                    <MapPin className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                    <span>{listing.location}</span>
                  </div>
                </div>

                {/* AI generated description */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1 mb-1.5">
                    <Sparkles className="h-3 w-3 text-indigo-500 dark:text-indigo-400 pulse-glow" /> AI description
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed italic">
                    "{listing.description}"
                  </p>
                </div>

                {/* AI generated categories */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Categories
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.categories.map((cat, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI generated tags */}
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    Searchable Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {listing.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1"
                      >
                        <Tag className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-100 dark:bg-slate-950/20 hover:bg-slate-200 dark:hover:bg-slate-950/40 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white py-2.5 text-xs font-semibold transition-all cursor-pointer"
                >
                  Edit Listing Input
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Matches Feed — BELOW */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              Matching Dropshippers
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
              Ranked dynamically by tag alignment against dropshippers sourcing intentions.
            </p>

            {loadingMatches ? (
              <div className="py-16 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-2" />
                <span className="text-xs text-slate-500">Recalculating tag overlaps...</span>
              </div>
            ) : !hasListing ? (
              <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-950/10">
                <Brain className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">Listing Profile Not Created</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
                  Once you publish your shop name and products, we will scan sourcing profiles to show matches here.
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center text-center px-6 bg-slate-50 dark:bg-slate-950/10">
                <Sparkles className="h-12 w-12 text-slate-400 dark:text-slate-700 mb-3" />
                <h4 className="text-slate-900 dark:text-white font-semibold text-sm">No Matches Yet</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 max-w-sm">
                  We couldn't find any dropshippers with matching categories or tags. Try broadening your product text list to generate matching elements!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matches.slice(0, expandedMatches ? matches.length : 3).map((m) => (
                    <MatchCard key={m.id} match={m} type="dropshipper" />
                  ))}
                </div>
                {matches.length > 3 && (
                  <div className="flex justify-center mt-6">
                    <button
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

export default ShopDashboard;
