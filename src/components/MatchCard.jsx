import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Tag, Check, Award, ExternalLink } from 'lucide-react';

const MatchCard = ({ match, type }) => {
  const navigate = useNavigate();
  const score = match.score || 0;
  const matchColor = score >= 5 ? 'from-emerald-400 to-teal-500' : score >= 3 ? 'from-indigo-400 to-sky-500' : 'from-slate-400 to-indigo-500';

  return (
    <div className="group glass-panel glass-panel-hover flex flex-col justify-between rounded-2xl p-5 relative overflow-hidden">
      {/* Background glow accent for high scores */}
      {score >= 5 && (
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
      )}

      {/* Header: name + score badge */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
            {type === 'shop' ? match.shopName : match.name}
          </h3>
          {type === 'shop' && match.location && (
            <div className="flex items-center gap-1 mt-1 text-slate-500 dark:text-slate-400 text-xs">
              <MapPin className="h-3 w-3 text-slate-400 dark:text-slate-500" />
              <span>{match.location}</span>
            </div>
          )}
          {type === 'dropshipper' && (
            <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
              Dropshipper Target
            </div>
          )}
        </div>

        <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${matchColor} px-2.5 py-1 text-xs font-bold text-slate-950 shadow-md shadow-indigo-950/20 shrink-0`}>
          <Award className="h-3 w-3" />
          Score: {score}
        </span>
      </div>

      {/* Description snippet */}
      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4 line-clamp-2">
        {type === 'shop'
          ? (match.description || match.rawProductText)
          : match.rawIntentText}
      </p>

      {/* Shared tags / categories */}
      <div className="space-y-2 mb-4">
        {match.sharedCategories && match.sharedCategories.length > 0 && (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Shared Categories
            </span>
            <div className="flex flex-wrap gap-1">
              {match.sharedCategories.map((cat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                >
                  <Check className="h-2.5 w-2.5" /> {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {match.sharedTags && match.sharedTags.length > 0 && (
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Shared Tags
            </span>
            <div className="flex flex-wrap gap-1">
              {match.sharedTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-0.5 rounded bg-teal-500/10 px-2 py-0.5 text-[11px] font-medium text-teal-600 dark:text-teal-300 border border-teal-500/10"
                >
                  <Tag className="h-2.5 w-2.5 text-teal-500 dark:text-teal-400" /> {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subtle detail link — clearly labelled as opening a detail view */}
      <div className="border-t border-slate-200 dark:border-slate-800/60 pt-3 mt-auto flex justify-end">
        <button
          type="button"
          onClick={() => navigate(`/match/${match.id}`)}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer"
        >
          <ExternalLink className="h-3 w-3" />
          Full Match Analysis
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
