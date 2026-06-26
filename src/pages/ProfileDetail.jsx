import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft, Store, Building2, MapPin, Tag, Mail, User,
  Loader2, AlertCircle, Hash, PackageSearch, Brain
} from 'lucide-react';

const ProfileDetail = () => {
  const { profileType, profileId } = useParams(); // profileType = 'shop' | 'dropshipper'
  const { token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const endpoint =
          profileType === 'shop'
            ? `/api/shop/profile/${profileId}`
            : `/api/dropshipper/profile/${profileId}`;

        const res = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
        setProfile(data);
      } catch (err) {
        setError(err.message || 'Could not load profile.');
      } finally {
        setLoading(false);
      }
    };

    if (token && profileId && profileType) fetchProfile();
  }, [profileId, profileType, token]);

  const isShop = profileType === 'shop';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-3" />
        <span className="text-xs text-slate-500 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 flex-1">
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-6 text-center">
          <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h4 className="text-slate-900 dark:text-white font-semibold text-lg">Profile Not Found</h4>
          <p className="text-slate-500 text-sm mt-1 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition-all hover:border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const accentColor = isShop
    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
    : 'text-sky-600 dark:text-sky-400 bg-sky-500/10 border-sky-500/20';

  const tagColor = isShop
    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/15'
    : 'bg-sky-500/10 text-sky-600 dark:text-sky-300 border-sky-500/15';

  const Icon = isShop ? Store : Building2;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 flex-1">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white text-xs font-semibold mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — identity panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Decorative bg icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Icon className="h-24 w-24" />
            </div>

            {/* Avatar */}
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${accentColor} mb-4 mt-2`}>
              <Icon className="h-8 w-8" />
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isShop ? profile.shopName : profile.ownerName}
            </h2>

            {isShop && profile.location && (
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                {profile.location}
              </div>
            )}

            {!isShop && (
              <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-sky-600 dark:text-sky-400">
                Dropshipper Agent
              </span>
            )}

            {/* Divider */}
            <div className="w-full border-t border-slate-200 dark:border-slate-800/80 my-5" />

            {/* Contact info */}
            <div className="w-full text-left space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Owner / Contact
                </span>
                <span className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <User className="h-4 w-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  {profile.ownerName}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Email
                </span>
                <a
                  href={`mailto:${profile.ownerEmail}`}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 font-medium"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {profile.ownerEmail}
                </a>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                  Profile Type
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border ${accentColor}`}>
                  <Icon className="h-3 w-3" />
                  {isShop ? 'Registered Shop' : 'Dropshipper'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — details panels */}
        <div className="lg:col-span-2 space-y-6">

          {/* Description / Intent */}
          <div className="glass-panel rounded-3xl p-7 space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-4">
              {isShop
                ? <><PackageSearch className="h-5 w-5 text-indigo-500" /> Shop Description</>
                : <><Brain className="h-5 w-5 text-sky-500" /> Sourcing Intent</>
              }
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 italic">
              "{isShop ? profile.description : profile.rawIntentText}"
            </p>

            {isShop && profile.rawProductText && (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Raw Product Keywords
                </span>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 font-mono">
                  {profile.rawProductText}
                </p>
              </div>
            )}
          </div>

          {/* Categories */}
          {profile.categories && profile.categories.length > 0 && (
            <div className="glass-panel rounded-3xl p-7">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Hash className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                {isShop ? 'Product Categories' : 'Sourcing Categories'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border ${tagColor}`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {profile.tags && profile.tags.length > 0 && (
            <div className="glass-panel rounded-3xl p-7">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                {isShop ? 'Product Tags' : 'Search Tags'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-300 border border-teal-500/15"
                  >
                    <Tag className="h-3 w-3 text-teal-500" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
};

export default ProfileDetail;
