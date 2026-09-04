import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { OverviewPage } from './pages/OverviewPage';
import { RiskMonitorPage } from './pages/RiskMonitorPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { DuplicatePage } from './pages/DuplicatePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CompliancePage } from './pages/CompliancePage';
import { MethodologyPage } from './pages/MethodologyPage';
import { RiskAssistantDrawer } from './components/chat/RiskAssistantDrawer';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [initialSeverity, setInitialSeverity] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const handleNavigateToRiskMonitor = (severity?: string) => {
    if (severity) setInitialSeverity(severity);
    setSelectedWorkId(null);
    setActiveTab('risk-monitor');
  };

  const handleSelectWork = (workId: string) => {
    setSelectedWorkId(workId);
  };

  const handleBackToMonitor = () => {
    setSelectedWorkId(null);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      if (searchQuery.toUpperCase().startsWith('WS/')) {
        setSelectedWorkId(searchQuery.trim());
      } else {
        setSelectedWorkId(null);
        setActiveTab('risk-monitor');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={selectedWorkId ? 'risk-detail' : activeTab}
        setActiveTab={(tab) => {
          setSelectedWorkId(null);
          setActiveTab(tab);
        }}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          onOpenChat={() => setIsChatOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          {selectedWorkId ? (
            <ProjectDetailPage workId={selectedWorkId} onBack={handleBackToMonitor} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewPage onNavigateToRiskMonitor={handleNavigateToRiskMonitor} />
              )}
              {activeTab === 'risk-monitor' && (
                <RiskMonitorPage
                  initialSeverity={initialSeverity}
                  onSelectWork={handleSelectWork}
                />
              )}
              {activeTab === 'duplicate-inspector' && (
                <DuplicatePage onSelectWork={handleSelectWork} />
              )}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'compliance' && (
                <CompliancePage onSelectWork={handleSelectWork} />
              )}
              {activeTab === 'methodology' && <MethodologyPage />}
            </>
          )}
        </main>
      </div>

      {/* AI Governance & Risk Assistant Drawer */}
      <RiskAssistantDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSelectWork={handleSelectWork}
      />
    </div>
  );
}

export default App;
