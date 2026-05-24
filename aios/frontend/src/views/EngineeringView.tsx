import { useState } from 'react'
import { motion } from 'framer-motion'
import { Folder, FileText, Code, Calculator, Lightbulb, AlertTriangle, Play, ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockProjects, mockTasks, mockDecisions, mockFailures, mockFiles } from '@/data/mockData'

type CockpitTab = 'overview' | 'requirements' | 'files' | 'code' | 'decisions' | 'failures' | 'output'

const TABS: { id: CockpitTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Folder size={12} /> },
  { id: 'requirements', label: 'Requirements', icon: <FileText size={12} /> },
  { id: 'files', label: 'Files', icon: <FileText size={12} /> },
  { id: 'code', label: 'Code', icon: <Code size={12} /> },
  { id: 'decisions', label: 'Decisions', icon: <Lightbulb size={12} /> },
  { id: 'failures', label: 'Failures', icon: <AlertTriangle size={12} /> },
  { id: 'output', label: 'Output', icon: <Play size={12} /> },
]

function TabOverview({ project }: { project: typeof mockProjects[0] }) {
  const tasks = mockTasks.filter(t => t.project_id === project.id)
  const done = tasks.filter(t => t.status === 'done').length
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Status', value: project.status, color: 'text-success' },
          { label: 'Phase', value: project.phase || '—', color: 'text-info' },
          { label: 'Progress', value: `${progress}%`, color: 'text-accent' },
        ].map(s => (
          <div key={s.label} className="panel-elevated p-3">
            <p className="text-2xs text-text-dim uppercase tracking-wider">{s.label}</p>
            <p className={`text-sm font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="panel p-3">
        <h3 className="text-xs font-semibold text-text-secondary mb-2">Goal</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{project.goal}</p>
      </div>

      <div className="panel p-3">
        <h3 className="text-xs font-semibold text-text-secondary mb-2">Summary</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{project.summary}</p>
      </div>

      <div className="panel p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-text-secondary">Task Progress</h3>
          <span className="text-2xs text-text-dim">{done}/{tasks.length} done</span>
        </div>
        <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-accent rounded-full"
          />
        </div>
        <div className="mt-2 space-y-1">
          {tasks.slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center gap-2 text-xs">
              {t.status === 'done' ? <CheckCircle size={12} className="text-success" /> :
               t.status === 'blocked' ? <XCircle size={12} className="text-danger" /> :
               <Clock size={12} className="text-warning" />}
              <span className={`${t.status === 'done' ? 'text-text-dim line-through' : 'text-text-secondary'} truncate`}>{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabFiles({ project }: { project: typeof mockProjects[0] }) {
  const files = mockFiles.filter(f => f.project_id === project.id)

  const grouped = files.reduce((acc, f) => {
    const g = f.file_type === 'code' ? 'Source Code' : f.file_type === 'pdf' ? 'Documents' : 'Other'
    if (!acc[g]) acc[g] = []
    acc[g].push(f)
    return acc
  }, {} as Record<string, typeof files>)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button className="btn-primary text-xs"><FileText size={12} /> Upload File</button>
        <button className="btn-ghost text-xs">Link Existing</button>
      </div>
      {Object.entries(grouped).map(([group, groupFiles]) => (
        <div key={group}>
          <h3 className="text-2xs font-semibold text-text-dim uppercase tracking-widest mb-2">{group}</h3>
          <div className="space-y-1.5">
            {groupFiles.map(f => (
              <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-elevated/50 hover:bg-elevated border border-border hover:border-border-bright transition-all cursor-pointer">
                <div className={`w-8 h-8 rounded flex items-center justify-center text-xs font-mono flex-shrink-0 ${
                  f.file_type === 'code' ? 'bg-info/10 text-info' : 'bg-danger/10 text-danger'
                }`}>
                  {f.file_type === 'code' ? '</>' : 'PDF'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{f.filename}</p>
                  <p className="text-2xs text-text-dim">{f.file_size_bytes ? `${(f.file_size_bytes / 1024).toFixed(0)} KB` : ''} · v{f.version}</p>
                </div>
                <span className="text-2xs text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">linked</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      {files.length === 0 && <p className="text-sm text-text-dim">No files linked yet. Upload or link files to this project.</p>}
    </div>
  )
}

function TabDecisions({ project }: { project: typeof mockProjects[0] }) {
  const decisions = mockDecisions.filter(d => d.project_id === project.id)
  const { setSelectedNode } = useUIStore()

  return (
    <div className="p-4 space-y-3">
      <button className="btn-primary text-xs"><Lightbulb size={12} /> Record Decision</button>
      {decisions.map(d => (
        <div
          key={d.id}
          onClick={() => setSelectedNode({ id: d.id, nodeType: 'decision', title: d.title })}
          className="panel p-3 cursor-pointer hover:border-agent/40 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-text-primary">{d.title}</h3>
            <span className={`tag border flex-shrink-0 ${
              d.outcome_assessment === 'good' ? 'text-success bg-success/10 border-success/20' :
              d.outcome_assessment === 'bad' ? 'text-danger bg-danger/10 border-danger/20' :
              'text-text-muted bg-elevated border-border'
            }`}>{d.outcome_assessment || 'pending'}</span>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{d.description}</p>
          {d.rationale && (
            <p className="text-xs text-text-dim mt-2 pl-2 border-l border-agent/30 italic">{d.rationale}</p>
          )}
          {d.outcome && (
            <p className="text-xs text-success mt-1.5">Outcome: {d.outcome}</p>
          )}
        </div>
      ))}
      {decisions.length === 0 && <p className="text-sm text-text-dim">No decisions recorded yet.</p>}
    </div>
  )
}

function TabFailures({ project }: { project: typeof mockProjects[0] }) {
  const failures = mockFailures.filter(f => f.project_id === project.id)
  const { setSelectedNode } = useUIStore()

  return (
    <div className="p-4 space-y-3">
      <button className="btn-danger text-xs"><AlertTriangle size={12} /> Log Failure</button>
      {failures.map(f => (
        <div
          key={f.id}
          onClick={() => setSelectedNode({ id: f.id, nodeType: 'failure', title: f.title })}
          className="panel p-3 cursor-pointer hover:border-danger/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-text-primary">{f.title}</h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`tag border ${f.severity === 'high' ? 'text-danger bg-danger/10 border-danger/20' : 'text-warning bg-warning/10 border-warning/20'}`}>{f.severity}</span>
              <span className={`tag border ${f.is_resolved ? 'text-success bg-success/10 border-success/20' : 'text-danger bg-danger/10 border-danger/20'}`}>{f.is_resolved ? 'resolved' : 'open'}</span>
            </div>
          </div>
          <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{f.description}</p>
          {f.lesson_learned && (
            <div className="mt-2 p-2 bg-warning/5 border border-warning/20 rounded text-xs text-warning">
              ⚠ Lesson: {f.lesson_learned}
            </div>
          )}
        </div>
      ))}
      {failures.length === 0 && <p className="text-sm text-text-dim">No failures logged for this project.</p>}
    </div>
  )
}

function TabOutput({ project }: { project: typeof mockProjects[0] }) {
  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-text-secondary">Generate outputs from this project's files and memory.</p>
      {[
        { label: 'Generate Progress Report', desc: 'LaTeX PDF from files + summaries', icon: <FileText size={14} />, color: 'text-info' },
        { label: 'Generate Task Plan', desc: 'Structured task breakdown from requirements', icon: <CheckCircle size={14} />, color: 'text-success' },
        { label: 'Summarize Project', desc: 'AI summary of current state', icon: <Lightbulb size={14} />, color: 'text-accent' },
        { label: 'Generate Lessons Learned', desc: 'Extract lessons from all failures', icon: <AlertTriangle size={14} />, color: 'text-warning' },
      ].map(a => (
        <button
          key={a.label}
          className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-elevated/50 hover:bg-elevated hover:border-border-bright transition-all text-left"
        >
          <span className={a.color}>{a.icon}</span>
          <div>
            <p className="text-sm text-text-primary font-medium">{a.label}</p>
            <p className="text-2xs text-text-dim">{a.desc}</p>
          </div>
          <Play size={13} className="text-text-dim ml-auto" />
        </button>
      ))}
    </div>
  )
}

export default function EngineeringView() {
  const { activeProjectId, setSelectedNode } = useUIStore()
  const [activeTab, setActiveTab] = useState<CockpitTab>('overview')
  const [projectDropdown, setProjectDropdown] = useState(false)

  const engineeringProjects = mockProjects.filter(p => p.type === 'engineering')
  const currentProjectId = activeProjectId || engineeringProjects[0]?.id
  const project = mockProjects.find(p => p.id === currentProjectId) || engineeringProjects[0]

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-text-dim text-sm">No engineering projects found. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cockpit header */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setProjectDropdown(!projectDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-elevated border border-border rounded-lg hover:border-border-bright transition-colors"
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="font-display font-semibold text-sm text-text-primary">{project.name}</span>
              <ChevronDown size={13} className="text-text-dim" />
            </button>
            {projectDropdown && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-elevated border border-border rounded-lg shadow-panel z-20 overflow-hidden">
                {mockProjects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { useUIStore.getState().setActiveProjectId(p.id); setProjectDropdown(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-surface hover:text-text-primary transition-colors text-left"
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                    <span className="ml-auto text-2xs text-text-dim">{p.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="tag bg-success/10 text-success border border-success/20">{project.status}</span>
            {project.phase && <span className="tag bg-info/10 text-info border border-info/20">{project.phase}</span>}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSelectedNode({ id: project.id, nodeType: 'project', title: project.name })}
              className="btn-ghost text-xs"
            >
              Inspect
            </button>
            <button className="btn-primary text-xs">
              <Play size={12} /> Generate Report
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5 mt-2.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'text-text-muted hover:text-text-secondary hover:bg-elevated'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === 'overview' && <TabOverview project={project} />}
          {activeTab === 'requirements' && (
            <div className="p-4">
              <p className="text-sm text-text-secondary leading-relaxed">{project.description}</p>
              <div className="mt-4 space-y-2">
                {['Automated moisture sensing', 'PWM motor control with thermal protection', 'I2C multi-sensor bus', 'Mobile monitoring interface', 'Data logging to SD card'].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'files' && <TabFiles project={project} />}
          {activeTab === 'code' && (
            <div className="p-4">
              {mockFiles.filter(f => f.project_id === project.id && f.file_type === 'code').map(f => (
                <div key={f.id} className="panel p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Code size={13} className="text-info" />
                    <span className="text-xs font-mono text-info">{f.filename}</span>
                    <span className="ml-auto text-2xs text-text-dim">v{f.version}</span>
                  </div>
                  <div className="bg-base rounded p-3 font-mono text-xs text-text-secondary">
                    <p className="text-text-dim">// Upload file to view contents</p>
                    <p className="mt-1">// File: {f.filename}</p>
                    <p>// Size: {f.file_size_bytes ? `${(f.file_size_bytes / 1024).toFixed(1)} KB` : 'unknown'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'decisions' && <TabDecisions project={project} />}
          {activeTab === 'failures' && <TabFailures project={project} />}
          {activeTab === 'output' && <TabOutput project={project} />}
        </motion.div>
      </div>
    </div>
  )
}
