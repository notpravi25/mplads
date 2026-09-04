import React from 'react';
import { Search, RefreshCw, Layers } from 'lucide-react';

interface TopbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header className="h-16 border-b border-[#222c3d] bg-[#111622]/90 backdrop-blur sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* System Status & Version Badge */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          System Active
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> 79,068 Sanctioned Base Works
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Work ID, Description, MP Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-700 rounded-md text-xs text-white font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
          />
        </div>
      </div>
    </header>
  );
};
