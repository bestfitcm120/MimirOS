import React from 'react'
import { useStore } from '../../stores/useStore'
import { Activity, Cpu, Workflow, Clock, Terminal } from 'lucide-react'

export default function BottomPanel() {
  const { dashboard } = useStore()

  const activeAgents = dashboard?.active_agents || 0
  const pendingApprovals = dashboard?.pending_approvals || 0

  return (
    <footer className="h-8 bg-nexus-bg border-t border-white/5 flex items-center px-3 gap-4 text-[11px] text-nexus-text/40">
      <div className="flex items-center gap-1.5">
        <Activity size={12} className="text-nexus-success" />
        <span>System Ready</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Cpu size={12} className={activeAgents > 0 ? 'text-nexus-accent' : 'text-nexus-text/30'} />
        <span>{activeAgents} Active Agents</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Workflow size={12} className="text-nexus-text/30" />
        <span>0 Running Workflows</span>
      </div>

      {pendingApprovals > 0 && (
        <div className="flex items-center gap-1.5 text-nexus-urgent">
          <Clock size={12} />
          <span>{pendingApprovals} Pending Approvals</span>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <Terminal size={12} />
        <span>Local Mode</span>
      </div>
    </footer>
  )
}
