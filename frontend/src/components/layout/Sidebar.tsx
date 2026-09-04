import React from 'react';
import { 
  BarChart3, 
  ShieldAlert, 
  Search, 
  Copy, 
  PieChart, 
  CheckSquare, 
  FileText, 
  Building2 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'overview', label: 'National Overview', icon: BarChart3 },
    { id: 'risk-monitor', label: 'Risk Intelligence Monitor', icon: ShieldAlert },
    { id: 'duplicate-inspector', label: 'Candidate Duplicate Inspector', icon: Copy },
    { id: 'analytics', label: 'Financial & Vendor Analytics', icon: PieChart },
    { id: 'compliance', label: 'Compliance & Evidence Gaps', icon: CheckSquare },
    { id: 'methodology', label: 'Analytical Methodology', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#111622] border-r border-[#222c3d] flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#222c3d] flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100">MPLADS AI MONITOR</h1>
            <p className="text-[11px] text-slate-400 font-medium">Risk Intelligence Platform</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#222c3d] bg-slate-900/60 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-300">Government Decision Support</p>
        <p className="mt-0.5">MPLADS Risk Intelligence • 79,068 Works</p>
      </div>
    </aside>
  );
};
