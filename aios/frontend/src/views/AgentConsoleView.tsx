import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight, Play, Square } from 'lucide-react'
import { mockAgents, mockAgentRuns } from '@/data/mockData'
import type { AgentInfo, AgentRun } from '@/types'
import { formatDistanceToNow } from 'date-fns'

function AgentStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string; dot: string }> = {
    running: { label: 'Running', color: 'text-success bg-success/10 border-success/20', dot: 'bg-success animate-pulse' },
    waiting_approval: { label: 'Needs Approval', color: 'text-warning bg-warning/10 border-warning/20', dot: 'bg-warning animate-pulse' },
    idle: { label: 'Idle', color: 'text-text-dim bg-elevated border-border', dot: 'bg-text-dim' },
    failed: { label: 'Failed', color: 'text-danger bg-danger/10 border-danger/20', dot: 'bg-danger' },
    completed: { label: 'Done', color: 'text-text-secondary bg-elevated border-border', dot: 'bg-success' },
  }
  const cfg = configs[status] || configs.idle
  return (
    <span className={`tag border flex items-center gap-1.5 ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function AgentTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    memory: 'text-agent', planning: 'text-info', engineering: 'text-engineering',
    research: 'text-accent', file_organizer: 'text-text-secondary', outreach: 'text-person',
  }
  return <Bot size={16} className={colors[type] || 'text-text-muted'} />
}

function RunRow({ run }: { run: AgentRun }) {
  const agent = mockAgents.find(a => a.id === run.agent_id)
  const isWaiting = run.status === 'waiting_approval'

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 rounded-lg border transition-colors ${
        isWaiting ? 'border-warning/30 bg-warning/5' :
        run.status === 'running' ? 'border-success/20 bg-success/5' :
        'border-border bg-elevated/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {agent && <AgentTypeIcon type={agent.agent_type} />}
          <div>
            <p className="text-xs font-medium text-text-primary">{agent?.name || 'Agent'}</p>
            <p className="text-2xs text-text-dim">{run.task_description}</p>
          </div>
        </div>
        <AgentStatusBadge status={run.status} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-2xs text-text-dim">
        <span>🔧 {run.tool_calls_count} tool calls</span>
        {run.started_at && <span>Started {formatDistanceToNow(new Date(run.started_at), { addSuffix: true })}</span>}
        {run.completed_at && <span>Completed {formatDistanceToNow(new Date(run.completed_at), { addSuffix: true })}</span>}
      </div>

      {run.result && (
        <div className="mt-2 p-2 bg-base/50 rounded text-xs text-text-secondary border border-border/50">
          {run.result}
        </div>
      )}

      {isWaiting && (
        <div className="mt-2 flex gap-2">
          <button className="btn-primary text-xs flex-1 justify-center">
            <CheckCircle size={12} /> Approve
          </button>
          <button className="btn-danger text-xs flex-1 justify-center">
            <XCircle size={12} /> Reject
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function AgentConsoleView() {
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(mockAgents[0])

  const agentRuns = selectedAgent
    ? mockAgentRuns.filter(r => r.agent_id === selectedAgent.id)
    : mockAgentRuns

  const pendingApprovals = mockAgentRuns.filter(r => r.status === 'waiting_approval')

  return (
    <div className="h-full flex">
      {/* Left — agent list */}
      <div className="w-56 flex-shrink-0 border-r border-border bg-surface overflow-y-auto scrollbar-thin">
        <div className="p-3 border-b border-border">
          <h2 className="text-xs font-semibold text-text-primary">Agents</h2>
          <p className="text-2xs text-text-dim mt-0.5">
            {mockAgents.filter(a => a.status === 'running').length} running ·{' '}
            {pendingApprovals.length} need approval
          </p>
        </div>

        {pendingApprovals.length > 0 && (
          <div className="p-3 border-b border-border">
            <div className="flex items-center gap-1.5 text-warning text-xs font-medium mb-1.5">
              <AlertTriangle size={12} /> Approvals needed
            </div>
            {pendingApprovals.map(r => (
              <div key={r.id} className="text-2xs text-text-secondary py-1">
                {mockAgents.find(a => a.id === r.agent_id)?.name}
              </div>
            ))}
          </div>
        )}

        <div className="p-2">
          {mockAgents.map(agent => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-left transition-colors mb-1 ${
                selectedAgent?.id === agent.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-elevated'
              }`}
            >
              <div className="relative">
                <AgentTypeIcon type={agent.agent_type} />
                <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surface ${
                  agent.status === 'running' ? 'bg-success animate-pulse-slow' :
                  agent.status === 'waiting_approval' ? 'bg-warning' : 'bg-text-dim'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{agent.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="h-1 flex-1 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${agent.performance_score * 100}%` }} />
                  </div>
                  <span className="text-2xs text-text-dim">{Math.round(agent.performance_score * 100)}%</span>
                </div>
              </div>
              {selectedAgent?.id === agent.id && <ChevronRight size={12} className="text-accent" />}
            </button>
          ))}
        </div>
      </div>

      {/* Right — agent detail */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {selectedAgent ? (
          <div>
            {/* Agent header */}
            <div className="sticky top-0 bg-surface border-b border-border p-4 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-elevated border border-border flex items-center justify-center">
                    <AgentTypeIcon type={selectedAgent.agent_type} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">{selectedAgent.name}</h2>
                    <p className="text-2xs text-text-dim capitalize">{selectedAgent.agent_type} agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <AgentStatusBadge status={selectedAgent.status} />
                  <button className="btn-primary text-xs">
                    <Play size={12} /> Run Task
                  </button>
                  {selectedAgent.status === 'running' && (
                    <button className="btn-ghost text-xs text-danger">
                      <Square size={12} /> Stop
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                {[
                  { label: 'Performance', value: `${Math.round(selectedAgent.performance_score * 100)}%` },
                  { label: 'Total Runs', value: mockAgentRuns.filter(r => r.agent_id === selectedAgent.id).length.toString() },
                  { label: 'Status', value: selectedAgent.status },
                ].map(s => (
                  <div key={s.label} className="panel-elevated p-2.5 text-center">
                    <p className="text-2xs text-text-dim">{s.label}</p>
                    <p className="text-sm font-semibold text-text-primary mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Run history */}
            <div className="p-4">
              <h3 className="text-xs font-semibold text-text-secondary mb-3">
                Activity Log
                {agentRuns.length === 0 && <span className="text-text-dim ml-2 font-normal">— no runs yet</span>}
              </h3>
              <div className="space-y-2">
                {agentRuns.length > 0 ? (
                  agentRuns.map(run => <RunRow key={run.id} run={run} />)
                ) : (
                  mockAgentRuns.map(run => <RunRow key={run.id} run={run} />)
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-text-dim text-sm">Select an agent to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
