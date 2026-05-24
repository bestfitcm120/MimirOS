import { X, Link, Edit, Lightbulb, Clock, Tag } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockProjects, mockTasks, mockDecisions, mockFailures, mockFiles } from '@/data/mockData'
// date-fns imported below

const NODE_COLOR: Record<string, string> = {
  project: 'text-info border-info/30 bg-info/10',
  task: 'text-success border-success/30 bg-success/10',
  file: 'text-text-secondary border-border bg-elevated',
  decision: 'text-agent border-agent/30 bg-agent/10',
  failure: 'text-danger border-danger/30 bg-danger/10',
  memory: 'text-accent border-accent/30 bg-accent/10',
  person: 'text-person border-person/30 bg-person/10',
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null
  const colors: Record<string, string> = {
    active: 'text-success bg-success/10 border-success/20',
    running: 'text-success bg-success/10 border-success/20',
    completed: 'text-text-secondary bg-elevated border-border',
    done: 'text-text-secondary bg-elevated border-border',
    blocked: 'text-danger bg-danger/10 border-danger/20',
    failed: 'text-danger bg-danger/10 border-danger/20',
    pending: 'text-warning bg-warning/10 border-warning/20',
    in_progress: 'text-info bg-info/10 border-info/20',
    paused: 'text-text-muted bg-elevated border-border',
    good: 'text-success bg-success/10 border-success/20',
    bad: 'text-danger bg-danger/10 border-danger/20',
  }
  return (
    <span className={`tag border ${colors[status] || 'text-text-muted bg-elevated border-border'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function getNodeDetails(nodeType: string, id: string) {
  switch (nodeType) {
    case 'project': {
      const p = mockProjects.find(x => x.id === id)
      if (!p) return null
      return {
        title: p.name,
        subtitle: p.type,
        status: p.status,
        summary: p.summary,
        phase: p.phase,
        goal: p.goal,
        connections: mockTasks.filter(t => t.project_id === id).map(t => ({ label: t.title, type: 'task', status: t.status })),
        files: mockFiles.filter(f => f.project_id === id).map(f => f.filename),
        decisions: mockDecisions.filter(d => d.project_id === id).map(d => d.title),
        failures: mockFailures.filter(f => f.project_id === id).map(f => f.title),
        suggestions: [
          'Generate progress report',
          'Review all open tasks',
          'Link to related projects',
        ],
      }
    }
    case 'task': {
      const t = mockTasks.find(x => x.id === id)
      if (!t) return null
      return {
        title: t.title,
        subtitle: 'Task',
        status: t.status,
        summary: t.description,
        phase: t.priority + ' priority',
        due: t.due_date,
        connections: [],
        files: [],
        decisions: [],
        failures: [],
        suggestions: ['Mark as done', 'Add to daily priorities', 'Create subtask'],
      }
    }
    case 'decision': {
      const d = mockDecisions.find(x => x.id === id)
      if (!d) return null
      return {
        title: d.title,
        subtitle: 'Decision',
        status: d.outcome_assessment || 'pending',
        summary: d.description,
        phase: d.rationale,
        connections: [],
        files: [],
        decisions: [d.alternatives || 'No alternatives recorded'],
        failures: [],
        suggestions: ['Record outcome', 'Link to related failure', 'Add to project lessons'],
      }
    }
    case 'failure': {
      const f = mockFailures.find(x => x.id === id)
      if (!f) return null
      return {
        title: f.title,
        subtitle: 'Failure — ' + f.severity,
        status: f.is_resolved ? 'resolved' : 'open',
        summary: f.description,
        phase: f.root_cause,
        connections: [],
        files: [],
        decisions: f.fix_applied ? [f.fix_applied] : [],
        failures: f.lesson_learned ? [f.lesson_learned] : [],
        suggestions: f.is_resolved ? ['Archive lesson', 'Link to decision'] : ['Mark as resolved', 'Add fix details'],
      }
    }
    default:
      return null
  }
}

export default function RightInspector() {
  const { selectedNode, setSelectedNode } = useUIStore()

  if (!selectedNode) {
    return (
      <div className="h-full bg-surface flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-full bg-elevated border border-border flex items-center justify-center mb-3">
          <Tag size={18} className="text-text-dim" />
        </div>
        <p className="text-xs text-text-dim text-center">Select any node in the graph or click a project card to inspect it</p>
      </div>
    )
  }

  const details = getNodeDetails(selectedNode.nodeType, selectedNode.id)
  const colorClass = NODE_COLOR[selectedNode.nodeType] || NODE_COLOR.memory

  return (
    <div className="h-full bg-surface overflow-y-auto scrollbar-thin animate-slide-in-right">
      {/* Header */}
      <div className="sticky top-0 bg-surface border-b border-border p-3 z-10">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`tag border text-2xs mb-1.5 ${colorClass}`}>
              {selectedNode.nodeType}
            </span>
            <h2 className="text-sm font-semibold text-text-primary leading-tight">
              {selectedNode.title}
            </h2>
            {details?.subtitle && (
              <p className="text-2xs text-text-dim mt-0.5">{details.subtitle}</p>
            )}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="btn-ghost p-1 rounded flex-shrink-0"
          >
            <X size={13} />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <StatusBadge status={details?.status} />
          {details?.phase && (
            <span className="text-2xs text-text-muted truncate">{details.phase}</span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-4">
        {/* Summary */}
        {details?.summary && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Summary</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{details.summary}</p>
          </section>
        )}

        {/* Goal */}
        {details?.goal && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Goal</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{details.goal}</p>
          </section>
        )}

        {/* Due date */}
        {details?.due && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Due</h4>
            <p className="text-xs text-warning flex items-center gap-1">
              <Clock size={11} />
              {new Date(details.due).toLocaleString()}
            </p>
          </section>
        )}

        {/* Connected tasks */}
        {details?.connections && details.connections.length > 0 && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">
              Tasks ({details.connections.length})
            </h4>
            <div className="space-y-1">
              {details.connections.map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
                  <span className={`status-dot ${c.status === 'done' ? 'bg-success' : c.status === 'blocked' ? 'bg-danger' : 'bg-warning'}`} />
                  <span className="text-xs text-text-secondary truncate">{c.label}</span>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Files */}
        {details?.files && details.files.length > 0 && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">
              Files ({details.files.length})
            </h4>
            <div className="space-y-1">
              {details.files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-text-secondary hover:text-text-primary cursor-pointer">
                  <Link size={10} className="text-text-dim" />
                  <span className="font-mono text-2xs">{f}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Decisions */}
        {details?.decisions && details.decisions.length > 0 && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Decisions</h4>
            <div className="space-y-1">
              {details.decisions.map((d, i) => (
                <p key={i} className="text-xs text-agent pl-2 border-l border-agent/30">{d}</p>
              ))}
            </div>
          </section>
        )}

        {/* Lessons / Failures */}
        {details?.failures && details.failures.length > 0 && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5">Lessons</h4>
            <div className="space-y-1">
              {details.failures.map((f, i) => (
                <p key={i} className="text-xs text-warning pl-2 border-l border-warning/30">{f}</p>
              ))}
            </div>
          </section>
        )}

        {/* AI Suggestions */}
        {details?.suggestions && (
          <section>
            <h4 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Lightbulb size={10} className="text-accent" /> Suggested Actions
            </h4>
            <div className="space-y-1">
              {details.suggestions.map((s, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs text-text-muted hover:text-accent px-2 py-1.5 rounded hover:bg-accent/5 transition-colors border border-transparent hover:border-accent/20"
                >
                  → {s}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Actions footer */}
      <div className="sticky bottom-0 p-3 border-t border-border bg-surface flex gap-2">
        <button className="btn-primary text-xs flex-1 justify-center">
          <Edit size={12} /> Edit
        </button>
        <button className="btn-ghost text-xs flex-1 justify-center">
          <Link size={12} /> Link
        </button>
      </div>
    </div>
  )
}
