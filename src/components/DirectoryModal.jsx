import React, { useState } from 'react';
import { X, Search, MapPin, Tag, Mail, User, Store, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const DirectoryModal = ({ isOpen, onClose, type, data }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter listings based on search query
  const filteredData = data.filter(item => {
    const query = searchQuery.toLowerCase();
    
    if (type === 'shop') {
      const nameMatch = item.shopName?.toLowerCase().includes(query);
      const locMatch = item.location?.toLowerCase().includes(query);
      const descMatch = item.description?.toLowerCase().includes(query);
      const catMatch = item.categories?.some(c => c.toLowerCase().includes(query));
      const tagMatch = item.tags?.some(t => t.toLowerCase().includes(query));
      return nameMatch || locMatch || descMatch || catMatch || tagMatch;
    } else {
      const nameMatch = item.ownerName?.toLowerCase().includes(query);
      const intentMatch = item.rawIntentText?.toLowerCase().includes(query);
      const catMatch = item.categories?.some(c => c.toLowerCase().includes(query));
      const tagMatch = item.tags?.some(t => t.toLowerCase().includes(query));
      return nameMatch || intentMatch || catMatch || tagMatch;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c0d10]/95 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              type === 'shop' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-sky-500/10 text-sky-400'
            }`}>
              {type === 'shop' ? <Store className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {type === 'shop' ? 'Registered Shops Directory' : 'Dropshippers Intent Directory'}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Displaying {filteredData.length} of {data.length} registered profiles
              </span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input Section */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/20">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={type === 'shop' ? 'Search by shop name, category, location, or tag...' : 'Search by name, intent, category, or tag...'}
              className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
            />
          </div>
        </div>

        {/* Modal Content / Directory List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredData.length === 0 ? (
            <div className="py-12 text-center">
              <Search className="h-12 w-12 text-slate-400 dark:text-slate-700 mx-auto mb-2" />
              <h4 className="text-slate-500 dark:text-slate-400 font-semibold text-sm">No Directory Matches</h4>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                Try widening your query keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredData.map((item) => (
                <div 
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Card Title */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">
                          {type === 'shop' ? item.shopName : item.ownerName}
                        </h4>
                        
                        {type === 'shop' && item.location && (
                          <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3 text-indigo-500 dark:text-indigo-400" />
                            <span>{item.location}</span>
                          </div>
                        )}
                        {type === 'dropshipper' && (
                          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold uppercase mt-0.5 tracking-wider">
                            Dropshipper Intent
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Body Text */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                      {type === 'shop' ? item.description : item.rawIntentText}
                    </p>

                    {/* Categories & Tags */}
                    <div className="space-y-2 mb-4">
                      {item.categories && item.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.categories.map((c, idx) => (
                            <span 
                              key={idx}
                              className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-500/10"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((t, idx) => (
                            <span 
                              key={idx}
                              className="rounded bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 flex items-center gap-0.5"
                            >
                              <Tag className="h-2 w-2 text-teal-500 dark:text-teal-400" />
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Card Actions */}
                  <div className="border-t border-slate-200 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs mt-auto">
                    <div className="text-[11px] text-slate-500">
                      <span className="block font-medium text-slate-700 dark:text-slate-400">{item.ownerName}</span>
                      <a href={`mailto:${item.ownerEmail}`} className="text-slate-500 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline">{item.ownerEmail}</a>
                    </div>
                    
                    <Link
                      to={`/profile/${type}/${item.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-white px-3 py-1.5 font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      Analyze
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DirectoryModal;
