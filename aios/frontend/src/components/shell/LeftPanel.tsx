import { motion } from 'framer-motion'
import { Folder, CheckSquare, FileText, AlertTriangle, Bot, Workflow, Clock, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockProjects, mockAgentRuns, mockNotifications } from '@/data/mockData'
// date-fns imported below
import type { InspectorItem } from '@/types'

function AgentStatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    running: 'bg-success animate-pulse-slow',
    waiting_approval: 'bg-warning animate-pulse',
    idle: 'bg-text-dim',
    failed: 'bg-danger',
  }
  return <span className={`status-dot ${colors[status] || 'bg-text-dim'}`} />
}

export default function LeftPanel() {
  const { setMode, setActiveProjectId, setSelectedNode } = useUIStore()

  const handleProjectClick = (projectId: string, projectName: string) => {
    setActiveProjectId(projectId)
    setMode('engineering')
    setSelectedNode({ id: projectId, nodeType: 'project', title: projectName } as InspectorItem)
  }

  const recentEvents = [
    ...mockAgentRuns.slice(0, 3).map(r => ({
      id: r.id,
      icon: <Bot size={12} className="text-agent" />,
      text: r.task_description.slice(0, 42) + '...',
      time: r.started_at,
      color: 'text-agent',
    })),
    ...mockNotifications.slice(0, 2).map(n => ({
      id: n.id,
      icon: <AlertTriangle size={12} className="text-warning" />,
      text: n.title,
      time: n.created_at,
      color: 'text-warning',
    })),
  ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime())

  return (
    <div className="h-full flex flex-col bg-surface overflow-y-auto scrollbar-thin">
      {/* Live Activity Feed */}
      <section className="p-3 border-b border-border">
        <h3 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-2">Live Activity</h3>
        <div className="space-y-2">
          {recentEvents.slice(0, 4).map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2"
            >
              <div className="flex-shrink-0 mt-0.5">{ev.icon}</div>
              <p className="text-2xs text-text-secondary leading-tight">{ev.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Projects */}
      <section className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xs font-semibold text-text-dim uppercase tracking-widest">Projects</h3>
          <button className="text-text-dim hover:text-accent transition-colors">
            <ChevronRight size={11} />
          </button>
        </div>
        <div className="space-y-1">
          {mockProjects.filter(p => p.status === 'active').map(project => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id, project.name)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-elevated transition-colors text-left group"
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-xs text-text-secondary group-hover:text-text-primary truncate transition-colors">
                {project.name}
              </span>
              {project.status === 'active' && (
                <span className="ml-auto text-2xs text-text-dim bg-elevated px-1.5 py-0.5 rounded">
                  {project.phase?.split(' ')[0]}
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Running Agents */}
      <section className="p-3 border-b border-border">
        <h3 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-2">Agents</h3>
        <div className="space-y-1.5">
          {mockAgentRuns
            .filter(r => r.status === 'running' || r.status === 'waiting_approval')
            .map(run => (
              <div key={run.id} className="flex items-center gap-2">
                <AgentStatusDot status={run.status} />
                <span className="text-2xs text-text-secondary truncate">
                  {run.task_description.slice(0, 30)}…
                </span>
              </div>
            ))}
          {!mockAgentRuns.some(r => r.status === 'running' || r.status === 'waiting_approval') && (
            <p className="text-2xs text-text-dim">No agents running</p>
          )}
        </div>
      </section>

      {/* Quick Nav */}
      <section className="p-3">
        <h3 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-2">Quick Nav</h3>
        <div className="space-y-0.5">
          {[
            { icon: <CheckSquare size={12} />, label: 'All Tasks', mode: 'daily' as const },
            { icon: <FileText size={12} />, label: 'Files', mode: 'files' as const },
            { icon: <Bot size={12} />, label: 'Agent Console', mode: 'agents' as const },
            { icon: <Workflow size={12} />, label: 'Workflows', mode: 'workflows' as const },
            { icon: <Clock size={12} />, label: 'Timeline', mode: 'timeline' as const },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => setMode(item.mode)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-text-muted hover:text-text-secondary hover:bg-elevated transition-colors text-left"
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
