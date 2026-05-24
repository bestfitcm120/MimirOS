import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, CheckSquare, Lightbulb, AlertTriangle, Bot, Workflow, Clock } from 'lucide-react'
import { mockTasks, mockDecisions, mockFailures, mockFiles, mockAgentRuns } from '@/data/mockData'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'
import { useUIStore } from '@/stores/uiStore'

interface TimelineEvent {
  id: string
  type: 'task' | 'decision' | 'failure' | 'file' | 'agent' | 'workflow'
  title: string
  subtitle?: string
  timestamp: string
  status?: string
  projectId?: string
}

function buildTimeline(): TimelineEvent[] {
  const events: TimelineEvent[] = [
    ...mockTasks.map(t => ({
      id: `task-${t.id}`,
      type: 'task' as const,
      title: t.title,
      subtitle: t.status,
      timestamp: t.updated_at,
      status: t.status,
      projectId: t.project_id,
    })),
    ...mockDecisions.map(d => ({
      id: `decision-${d.id}`,
      type: 'decision' as const,
      title: d.title,
      subtitle: 'Decision recorded',
      timestamp: d.decided_at,
      status: d.outcome_assessment,
      projectId: d.project_id,
    })),
    ...mockFailures.map(f => ({
      id: `failure-${f.id}`,
      type: 'failure' as const,
      title: f.title,
      subtitle: f.is_resolved ? 'Resolved' : 'Open',
      timestamp: f.occurred_at,
      status: f.is_resolved ? 'resolved' : 'open',
      projectId: f.project_id,
    })),
    ...mockFiles.map(f => ({
      id: `file-${f.id}`,
      type: 'file' as const,
      title: f.filename,
      subtitle: `v${f.version} uploaded`,
      timestamp: f.created_at,
      projectId: f.project_id,
    })),
    ...mockAgentRuns.map(r => ({
      id: `agent-${r.id}`,
      type: 'agent' as const,
      title: r.task_description,
      subtitle: r.status,
      timestamp: r.started_at || new Date().toISOString(),
      status: r.status,
    })),
  ]

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const EVENT_STYLES: Record<string, { icon: React.ReactNode; color: string; dotColor: string }> = {
  task: { icon: <CheckSquare size={13} />, color: 'text-success', dotColor: 'bg-success' },
  decision: { icon: <Lightbulb size={13} />, color: 'text-agent', dotColor: 'bg-agent' },
  failure: { icon: <AlertTriangle size={13} />, color: 'text-danger', dotColor: 'bg-danger' },
  file: { icon: <FileText size={13} />, color: 'text-text-secondary', dotColor: 'bg-text-dim' },
  agent: { icon: <Bot size={13} />, color: 'text-agent', dotColor: 'bg-agent' },
  workflow: { icon: <Workflow size={13} />, color: 'text-info', dotColor: 'bg-info' },
}

function groupByDate(events: TimelineEvent[]) {
  const groups: Record<string, TimelineEvent[]> = {}
  events.forEach(ev => {
    const d = new Date(ev.timestamp)
    const key = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy')
    if (!groups[key]) groups[key] = []
    groups[key].push(ev)
  })
  return groups
}

export default function TimelineView() {
  const { setSelectedNode } = useUIStore()
  const [filterType, setFilterType] = useState<string>('all')
  const allEvents = buildTimeline()
  const filtered = filterType === 'all' ? allEvents : allEvents.filter(e => e.type === filterType)
  const grouped = groupByDate(filtered)

  const handleEventClick = (ev: TimelineEvent) => {
    const typeMap: Record<string, string> = {
      task: 'task', decision: 'decision', failure: 'failure', file: 'file'
    }
    const nodeType = typeMap[ev.type]
    if (nodeType) {
      const id = ev.id.replace(`${ev.type}-`, '')
      setSelectedNode({ id, nodeType: nodeType as any, title: ev.title, status: ev.status })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-sm font-semibold text-text-primary">Timeline</h2>
          <div className="flex items-center gap-1">
            {['all', 'task', 'decision', 'failure', 'file', 'agent'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all capitalize ${
                  filterType === t ? 'bg-accent/15 text-accent border border-accent/30' : 'text-text-dim hover:text-text-secondary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="ml-auto text-2xs text-text-dim">{filtered.length} events</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
        {Object.entries(grouped).map(([dateLabel, events], gi) => (
          <div key={dateLabel} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                dateLabel === 'Today' ? 'text-accent bg-accent/10 border-accent/20' : 'text-text-dim bg-elevated border-border'
              }`}>{dateLabel}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-2">
                {events.map((ev, i) => {
                  const style = EVENT_STYLES[ev.type] || EVENT_STYLES.file
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => handleEventClick(ev)}
                      className="flex items-start gap-4 pl-8 relative cursor-pointer group"
                    >
                      {/* Dot */}
                      <div className={`absolute left-2 top-2.5 w-3 h-3 rounded-full border-2 border-surface ${style.dotColor}`} />

                      {/* Card */}
                      <div className="flex-1 flex items-start gap-3 p-2.5 rounded-lg border border-transparent hover:border-border hover:bg-elevated/40 transition-colors">
                        <span className={style.color}>{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-secondary group-hover:text-text-primary truncate transition-colors">{ev.title}</p>
                          {ev.subtitle && <p className="text-2xs text-text-dim mt-0.5">{ev.subtitle}</p>}
                        </div>
                        <span className="text-2xs text-text-dim flex-shrink-0 flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(ev.timestamp), 'HH:mm')}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="h-full flex items-center justify-center">
            <p className="text-text-dim text-sm">No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  )
}
