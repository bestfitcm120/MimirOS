import { Activity, GitBranch, Bot, Wifi } from 'lucide-react'
import { mockAgentRuns, mockWorkflowRuns } from '@/data/mockData'

export default function BottomBar() {
  const runningAgents = mockAgentRuns.filter(r => r.status === 'running').length
  const activeWorkflows = mockWorkflowRuns.filter(r => r.status === 'running' || r.status === 'waiting_approval').length

  const timelinePoints = [
    { label: 'May 19', active: false },
    { label: 'May 20', active: false },
    { label: 'May 21', active: false },
    { label: 'May 22', active: false },
    { label: 'Today', active: true },
  ]

  return (
    <footer className="flex-shrink-0 h-8 border-t border-border bg-surface flex items-center px-3 gap-4 text-2xs text-text-dim">
      {/* Timeline scrubber */}
      <div className="flex items-center gap-3 flex-1">
        <Activity size={11} className="text-text-dim flex-shrink-0" />
        <div className="flex items-center gap-1">
          {timelinePoints.map((p, i) => (
            <div key={p.label} className="flex items-center gap-1">
              {i > 0 && <div className="w-8 h-px bg-border" />}
              <button className={`px-2 py-0.5 rounded text-2xs transition-colors ${
                p.active
                  ? 'text-accent bg-accent/10 border border-accent/20'
                  : 'text-text-dim hover:text-text-muted'
              }`}>
                {p.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Bot size={11} className={runningAgents > 0 ? 'text-success' : 'text-text-dim'} />
          <span className={runningAgents > 0 ? 'text-success' : ''}>
            {runningAgents} agent{runningAgents !== 1 ? 's' : ''} running
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitBranch size={11} className={activeWorkflows > 0 ? 'text-info' : 'text-text-dim'} />
          <span className={activeWorkflows > 0 ? 'text-info' : ''}>
            {activeWorkflows} workflow{activeWorkflows !== 1 ? 's' : ''} active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wifi size={11} className="text-success" />
          <span className="text-success">Connected</span>
        </div>
        <span className="text-text-dim">AIOS v1.0.0</span>
      </div>
    </footer>
  )
}
