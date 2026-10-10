import React, { useState, useEffect } from 'react';
import { api } from '../../services/apiClient';
import { GovernancePolicy, AiInteractionLog, AuditLog } from '../../types';
import { ProvenanceChip } from '../../components/ui/ProvenanceChip';
import { AiBadge } from '../../components/ui/AiBadge';
import { 
  ShieldCheck, 
  FileText, 
  Cpu, 
  RotateCw, 
  CheckCircle2, 
  Quote, 
  Terminal,
  Activity
} from 'lucide-react';

export const AiGovernancePage: React.FC = () => {
  const [policy, setPolicy] = useState<GovernancePolicy | null>(null);
  const [aiLogs, setAiLogs] = useState<AiInteractionLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'audit'>('ai');
  const [loading, setLoading] = useState(true);

  const fetchGovernanceData = async () => {
    try {
      const [pol, aiL, audL] = await Promise.all([
        api.getGovernancePolicy(),
        api.getGovernanceLogs('ai', 50),
        api.getGovernanceLogs('audit', 50)
      ]);
      setPolicy(pol);
      if (aiL.ai) setAiLogs(aiL.ai);
      if (audL.audit) setAuditLogs(audL.audit);
    } catch (err) {
      console.error('Failed to load governance logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernanceData();
    const interval = setInterval(fetchGovernanceData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !policy) {
    return <div className="p-8 text-center text-slate-400">Loading AI Governance & Audit Ledger...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0B1B3A] border border-indigo-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
              Institutional AI Governance · G01 / G02
            </span>
            <ProvenanceChip provenance="MIXED" />
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            AI Policy Enforcement & Immutable Audit Ledger
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time trace logs of all generative model invocations, approval gates, and session state actions.
          </p>
        </div>

        <button
          onClick={fetchGovernanceData}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh Logs"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Policy Card & Model Configuration (Build Plan §18, G01) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            AI OPERATIONAL MODE
          </span>
          <span className="text-base font-bold text-white block">
            {policy.ai_mode}
          </span>
          <span className="text-xs text-emerald-400 mt-1 block">Deterministic Fallback Protected</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            GROUNDING SOURCES
          </span>
          <span className="text-base font-bold text-indigo-400 block truncate" title={policy.sources}>
            {policy.sources}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Approved Syllabus Ch. 4</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            DATA PRIVACY SPEC
          </span>
          <span className="text-base font-bold text-emerald-400 block">
            Non-Surveillance (k ≥ 5)
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Aggregated Cohort Only</span>
        </div>

        <div className="p-4 rounded-xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            PRIMARY MODEL BACKBONE
          </span>
          <span className="text-base font-bold text-violet-400 block truncate" title={policy.model_name}>
            {policy.model_name}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Google Gemini API Gateway</span>
        </div>
      </div>

      {/* Usage Policy Guidelines Accordion */}
      <div className="p-6 rounded-2xl bg-navy-900/70 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Scope Global Skills University AI Usage Standards
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {policy.usage_policy.map((rule, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Tab Switcher (AI Logs vs Audit Logs) */}
      <div className="p-6 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Interaction Ledger ({aiLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Action Audit ({auditLogs.length})
            </button>
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Live Sync (3s polling)</span>
          </div>
        </div>

        {/* AI Invocations Table */}
        {activeTab === 'ai' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">USER / ROLE</th>
                  <th className="py-2.5 px-3">AI FUNCTION</th>
                  <th className="py-2.5 px-3">MODEL</th>
                  <th className="py-2.5 px-3">STATUS</th>
                  <th className="py-2.5 px-3">PROMPT SUMMARY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {aiLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-white">
                      <div>{log.user}</div>
                      <span className="text-[10px] text-slate-500 font-sans">{log.role}</span>
                    </td>
                    <td className="py-3 px-3 text-indigo-400 font-bold">
                      {log.function}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {log.model}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans max-w-xs truncate" title={log.prompt_summary}>
                      {log.prompt_summary || 'Standard inference invocation'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* System Audit Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2.5 px-3">TIMESTAMP</th>
                  <th className="py-2.5 px-3">ACTOR</th>
                  <th className="py-2.5 px-3">ACTION</th>
                  <th className="py-2.5 px-3">ENTITY / PAYLOAD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map((aud) => (
                  <tr key={aud.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(aud.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3 text-white">
                      <div>{aud.user}</div>
                      <span className="text-[10px] text-slate-500 font-sans">{aud.role}</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {aud.action}
                    </td>
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {aud.entity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
