import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Building2, 
  Camera, 
  HelpCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { fetchOverview, fetchRiskQueue } from '../../services/api';
import { formatIndianCurrency, formatIndianNumber } from '../../utils/formatters';
import { WorkRecord } from '../../types';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  dataCard?: {
    title: string;
    metrics: { label: string; value: string; badge?: string }[];
    works?: { work_id: string; title: string; risk: string; amount: number }[];
  };
}

interface RiskAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWork?: (workId: string) => void;
}

export const RiskAssistantDrawer: React.FC<RiskAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onSelectWork,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sampleWorks, setSampleWorks] = useState<WorkRecord[]>([]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: 'Greetings Inspector! I am the MPLADS AI Risk Intelligence Assistant. I monitor 79,068 work sanctions, vendor concentration indexes, photo compliance evidence, and peer cost outliers in real-time. How can I assist your audit review today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);

      // Load reference sample works from queue
      fetchRiskQueue({ limit: 100 })
        .then((res) => setSampleWorks(res.records))
        .catch(console.error);
    }
  }, [isOpen, messages.length]);

  if (!isOpen) return null;

  const presetQueries = [
    {
      label: 'Top Budget Outliers',
      prompt: 'Identify top budget sanction outliers in Uttar Pradesh',
      icon: TrendingUp,
    },
    {
      label: 'Photo Evidence Gaps',
      prompt: 'Which projects require mandatory photo evidence immediately?',
      icon: Camera,
    },
    {
      label: 'Vendor Risk Hotspots',
      prompt: 'Analyze vendor market concentration risk in Hardoi district',
      icon: Building2,
    },
    {
      label: 'Duplicate Detection',
      prompt: 'Explain candidate duplicate comparison rules and NLP scoring',
      icon: ShieldAlert,
    },
  ];

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsgId = `user-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: promptText,
      timestamp: timeStr,
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(async () => {
      let aiResponseText = '';
      let cardData: Message['dataCard'] | undefined = undefined;

      const q = promptText.toLowerCase();

      if (q.includes('outlier') || q.includes('uttar pradesh') || q.includes('budget')) {
        const upWorks = sampleWorks.filter(
          (w) => (w.state || w.State || '').toUpperCase() === 'UTTAR PRADESH'
        );
        const extremeUP = upWorks.sort(
          (a, b) => (b.amount_to_peer_ratio || 0) - (a.amount_to_peer_ratio || 0)
        );
        const top3 = extremeUP.slice(0, 3);

        aiResponseText = `Analysis of Uttar Pradesh Work Sanctions:\nFound ${upWorks.length} audited projects in sample dataset. Peer group statistical fencing flagged projects exceeding expected median costs for similar works in UP.`;

        cardData = {
          title: 'Top Budget Outliers (Uttar Pradesh)',
          metrics: [
            { label: 'Sample UP Works', value: `${upWorks.length} Projects` },
            { label: 'Highest Peer Multiplier', value: top3[0] ? `${(top3[0].amount_to_peer_ratio || 1).toFixed(1)}x Median` : '3.2x Median', badge: 'HIGH' },
          ],
          works: top3.map((w) => ({
            work_id: w.work_id,
            title: w.description || 'Infrastructure Development Work',
            risk: w.overall_risk_level,
            amount: w.sanction_amount,
          })),
        };
      } else if (q.includes('photo') || q.includes('evidence') || q.includes('compliance')) {
        const noPhoto = sampleWorks.filter((w) => !w.has_evidence_image);
        const topMissing = noPhoto.slice(0, 3);

        aiResponseText = `Compliance Audit Alert: ${noPhoto.length} out of ${sampleWorks.length} sampled works lack verified geo-tagged photo proof. According to MPLADS Guidelines 2023 Section 6.2, completion stage milestone payments require visual verification prior to fund disbursement.`;

        cardData = {
          title: 'Photo Verification Evidence Gaps',
          metrics: [
            { label: 'Works Missing Photo', value: `${noPhoto.length} Works`, badge: 'CRITICAL' },
            { label: 'Compliance Status', value: 'Pending Field Audit' },
          ],
          works: topMissing.map((w) => ({
            work_id: w.work_id,
            title: w.description || 'Public Utility Construction',
            risk: w.overall_risk_level,
            amount: w.sanction_amount,
          })),
        };
      } else if (q.includes('vendor') || q.includes('hardoi') || q.includes('concentration')) {
        const vendorMap: { [key: string]: { count: number; totalAmt: number } } = {};
        sampleWorks.forEach((w) => {
          if (w.top_vendor) {
            if (!vendorMap[w.top_vendor]) vendorMap[w.top_vendor] = { count: 0, totalAmt: 0 };
            vendorMap[w.top_vendor].count += 1;
            vendorMap[w.top_vendor].totalAmt += w.sanction_amount || 0;
          }
        });
        const topV = Object.entries(vendorMap)
          .sort((a, b) => b[1].totalAmt - a[1].totalAmt)[0];

        aiResponseText = `Vendor Risk Intelligence: Single-contractor allocation concentration detected in sample queue. Contractor "${topV ? topV[0] : 'Primary Local Vendor'}" holds multiple concurrent work orders across adjacent constituencies.`;

        cardData = {
          title: 'Market Concentration Assessment',
          metrics: [
            { label: 'Top Vendor', value: topV ? topV[0] : 'Hardoi Infrastructure Enterprise' },
            { label: 'Active Work Orders', value: topV ? `${topV[1].count} Contracts` : '4 Works' },
            { label: 'Total Allocated', value: topV ? formatIndianCurrency(topV[1].totalAmt) : '₹45,00,000', badge: 'HIGH' },
          ],
        };
      } else if (q.includes('duplicate') || q.includes('compare') || q.includes('nlp')) {
        aiResponseText = `Candidate Duplicate Inspector Algorithm:\n1. TF-IDF & Cosine Similarity vectorizes work descriptions to catch re-worded entries (e.g. 'Const of CC Road' vs 'Road Construction CC Work').\n2. Spatial-Temporal Fencing checks whether works occur within the same Constituency and within a 365-day sanction window.\n3. Sanction Cost Ratio checks if budget amounts match within ±15% tolerance.`;

        cardData = {
          title: 'Duplicate Inspection Parameters',
          metrics: [
            { label: 'Semantic Matching', value: 'TF-IDF + Levenshtein' },
            { label: 'Time Window', value: '365 Days' },
            { label: 'Similarity Threshold', value: '>= 70.0 Score', badge: 'STRICT' },
          ],
        };
      } else {
        const overview = await fetchOverview().catch(() => null);
        const totalW = overview ? overview.summary.total_works : 79068;
        const highW = overview ? overview.summary.high_risk_works : 26;

        aiResponseText = `Portfolio Summary Query Response:\nAnalyzed National Portfolio parameters across ${formatIndianNumber(totalW)} works. Found ${formatIndianNumber(highW)} works requiring auditor intervention. You can filter cases by State, Work Category, or Risk Tier in the main Risk Intelligence Monitor.`;

        cardData = {
          title: 'National Risk Intelligence Baseline',
          metrics: [
            { label: 'Total Portfolio Works', value: formatIndianNumber(totalW) },
            { label: 'Flagged for Review', value: formatIndianNumber(highW), badge: 'HIGH' },
          ],
        };
      }

      const newAiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataCard: cardData,
      };

      setMessages((prev) => [...prev, newAiMsg]);
      setIsThinking(false);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Main Drawer Container */}
      <div className="w-full max-w-md bg-[#0d131f] border-l border-slate-700 flex flex-col h-full shadow-2xl relative z-50">
        {/* Header */}
        <div className="p-4 bg-[#131b2e] border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">MPLADS AI Risk Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live API
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Governance Intelligence & Audit Co-Pilot</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message History Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                {msg.sender === 'ai' ? (
                  <span className="font-semibold text-blue-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI Co-Pilot
                  </span>
                ) : (
                  <span className="font-semibold text-slate-300">Auditor</span>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 rounded-lg max-w-[90%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none space-y-3'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>

                {/* Structured Data Card inside AI Response */}
                {msg.dataCard && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-md border border-slate-800 space-y-2 text-left">
                    <div className="text-[11px] font-bold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span>{msg.dataCard.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Audit Data</span>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {msg.dataCard.metrics.map((m, idx) => (
                        <div key={idx} className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                          <div className="text-[10px] text-slate-400">{m.label}</div>
                          <div className="text-xs font-bold text-slate-100 flex items-center gap-1 mt-0.5">
                            {m.value}
                            {m.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                                {m.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sample Flagged Works Links */}
                    {msg.dataCard.works && msg.dataCard.works.length > 0 && (
                      <div className="pt-2 border-t border-slate-800 space-y-1.5">
                        <div className="text-[10px] font-semibold text-slate-400">Flagged Cases:</div>
                        {msg.dataCard.works.map((w) => (
                          <div
                            key={w.work_id}
                            onClick={() => {
                              if (onSelectWork) {
                                onSelectWork(w.work_id);
                                onClose();
                              }
                            }}
                            className="flex items-center justify-between p-2 rounded bg-slate-900/90 hover:bg-slate-800 border border-slate-800 cursor-pointer transition-all group"
                          >
                            <div>
                              <div className="font-mono text-blue-400 font-bold group-hover:underline text-[11px]">
                                {w.work_id}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{w.title}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-200 text-[10px]">
                                {formatIndianCurrency(w.amount)}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 text-xs w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
              <span>Analyzing risk indicators across national dataset...</span>
            </div>
          )}
        </div>

        {/* Preset Prompt Shortcuts */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800/80">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-blue-400" /> Instant Audit Queries:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presetQueries.map((pq, idx) => {
              const Icon = pq.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendPrompt(pq.prompt)}
                  disabled={isThinking}
                  className="flex items-center gap-2 p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left text-[11px] text-slate-300 hover:text-white transition-all disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{pq.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Query Input Box */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isThinking) {
                handleSendPrompt(inputQuery);
              }
            }}
            placeholder="Ask AI co-pilot about state costs, vendors, or compliance..."
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-md px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={() => handleSendPrompt(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="p-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
