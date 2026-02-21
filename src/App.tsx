import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Phone, 
  CreditCard, 
  AlertTriangle, 
  Activity, 
  Search, 
  Database, 
  BarChart3,
  RefreshCw,
  User,
  ArrowRightLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkGraph } from './components/NetworkGraph';

interface Stats {
  accountCount: number;
  transactionCount: number;
  callCount: number;
}

interface Analysis {
  riskScore: number;
  findings: string[];
  suspiciousEntities: string[];
}

export default function App() {
  const [stats, setStats] = useState<Stats>({ accountCount: 0, transactionCount: 0, callCount: 0 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'dashboard' | 'graph' | 'data'>('dashboard');

  const fetchData = async () => {
    try {
      const [statsRes, graphRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/graph')
      ]);
      setStats(await statsRes.json());
      setGraphData(await graphRes.json());
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze');
      setAnalysis(await res.json());
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    await fetch('/api/seed', { method: 'POST' });
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-[#141414] p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#141414] rounded flex items-center justify-center">
            <Shield className="text-[#E4E3E0] w-5 h-5" />
          </div>
          <h1 className="font-serif italic text-xl font-bold tracking-tight">FinLink AI</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-all ${view === 'dashboard' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}`}
          >
            <BarChart3 size={18} />
            <span className="text-sm font-medium">Overview</span>
          </button>
          <button 
            onClick={() => setView('graph')}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-all ${view === 'graph' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}`}
          >
            <Activity size={18} />
            <span className="text-sm font-medium">Network Graph</span>
          </button>
          <button 
            onClick={() => setView('data')}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-all ${view === 'data' ? 'bg-[#141414] text-[#E4E3E0]' : 'hover:bg-[#141414]/5'}`}
          >
            <Database size={18} />
            <span className="text-sm font-medium">Data Explorer</span>
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#141414]/20">
          <button 
            onClick={seedData}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-[#141414] rounded text-xs font-mono uppercase tracking-widest hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors"
          >
            <RefreshCw size={14} />
            Seed Demo Data
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <header className="flex justify-between items-end mb-12 border-b border-[#141414] pb-8">
          <div>
            <p className="font-serif italic text-xs opacity-50 uppercase tracking-widest mb-2">Intelligence Dashboard</p>
            <h2 className="text-4xl font-bold tracking-tighter">Financial Relationship Analysis</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={runAnalysis}
              disabled={loading}
              className="px-6 py-3 bg-[#141414] text-[#E4E3E0] rounded font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Search size={16} />}
              Run AI Analysis
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-12 gap-6"
            >
              {/* Stats Cards */}
              <div className="col-span-4 border border-[#141414] p-6 bg-white/50">
                <p className="font-serif italic text-xs opacity-50 uppercase mb-4">Total Accounts</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-mono font-bold tracking-tighter">{stats.accountCount}</span>
                  <CreditCard className="opacity-20" size={40} />
                </div>
              </div>
              <div className="col-span-4 border border-[#141414] p-6 bg-white/50">
                <p className="font-serif italic text-xs opacity-50 uppercase mb-4">Transactions</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-mono font-bold tracking-tighter">{stats.transactionCount}</span>
                  <ArrowRightLeft className="opacity-20" size={40} />
                </div>
              </div>
              <div className="col-span-4 border border-[#141414] p-6 bg-white/50">
                <p className="font-serif italic text-xs opacity-50 uppercase mb-4">Call Records</p>
                <div className="flex items-end justify-between">
                  <span className="text-5xl font-mono font-bold tracking-tighter">{stats.callCount}</span>
                  <Phone className="opacity-20" size={40} />
                </div>
              </div>

              {/* AI Analysis Results */}
              <div className="col-span-8 border border-[#141414] p-8 bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold tracking-tight uppercase">AI Risk Assessment</h3>
                  {analysis && (
                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${analysis.riskScore > 70 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      Score: {analysis.riskScore}/100
                    </div>
                  )}
                </div>

                {!analysis ? (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#141414]/20 rounded-lg">
                    <Search size={48} className="opacity-10 mb-4" />
                    <p className="text-sm opacity-50 italic font-serif">Run analysis to identify suspicious patterns</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Key Findings</h4>
                      <ul className="space-y-2">
                        {analysis.findings.map((finding, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm border-b border-[#141414]/10 pb-2">
                            <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-3">Suspicious Entities</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.suspiciousEntities.map((entity, i) => (
                          <span key={i} className="px-3 py-1 bg-[#141414] text-[#E4E3E0] text-xs font-mono rounded">
                            {entity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="col-span-4 space-y-6">
                <div className="border border-[#141414] p-6 bg-[#141414] text-[#E4E3E0]">
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span>Database Engine</span>
                      <span className="font-mono text-green-400">ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>AI Model (Gemini 3)</span>
                      <span className="font-mono text-green-400">READY</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span>Graph Engine</span>
                      <span className="font-mono text-green-400">ACTIVE</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-[#141414] p-6 bg-white">
                  <h3 className="font-bold uppercase tracking-widest text-xs mb-4">Recent Alerts</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start border-l-2 border-red-500 pl-3">
                      <div>
                        <p className="text-xs font-bold">Multiple Accounts / Single SIM</p>
                        <p className="text-[10px] opacity-50">Detected 2 accounts linked to 9876543210</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start border-l-2 border-amber-500 pl-3">
                      <div>
                        <p className="text-xs font-bold">High Velocity Transaction</p>
                        <p className="text-[10px] opacity-50">ACC003 received multiple transfers in 1hr</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'graph' && (
            <motion.div 
              key="graph"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold tracking-tight uppercase">Network Relationship Map</h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1e293b]"></div>
                    <span>Bank Account</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                    <span>Phone Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-[#10b981]"></div>
                    <span>Transaction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-[#3b82f6]"></div>
                    <span>Call</span>
                  </div>
                </div>
              </div>
              <NetworkGraph data={graphData} />
            </motion.div>
          )}

          {view === 'data' && (
            <motion.div 
              key="data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-[#141414] bg-white overflow-hidden"
            >
              <div className="p-4 border-b border-[#141414] bg-[#141414] text-[#E4E3E0] flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest">Master Data Explorer</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border border-[#E4E3E0]/30 rounded text-[10px] hover:bg-white hover:text-[#141414] transition-colors">EXPORT CSV</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#141414] bg-[#141414]/5">
                      <th className="p-4 font-serif italic font-bold uppercase opacity-50">ID</th>
                      <th className="p-4 font-serif italic font-bold uppercase opacity-50">Entity</th>
                      <th className="p-4 font-serif italic font-bold uppercase opacity-50">Type</th>
                      <th className="p-4 font-serif italic font-bold uppercase opacity-50">Risk Status</th>
                      <th className="p-4 font-serif italic font-bold uppercase opacity-50">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphData.nodes.map((node: any, i) => (
                      <tr key={i} className="border-b border-[#141414]/10 hover:bg-[#141414]/5 transition-colors group cursor-pointer">
                        <td className="p-4 font-mono">{node.id}</td>
                        <td className="p-4 font-bold">{node.label || 'N/A'}</td>
                        <td className="p-4 uppercase text-[10px] font-bold opacity-50">{node.type}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${i % 3 === 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {i % 3 === 0 ? 'Review Required' : 'Verified'}
                          </span>
                        </td>
                        <td className="p-4 opacity-50">2024-02-21 09:12:00</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
