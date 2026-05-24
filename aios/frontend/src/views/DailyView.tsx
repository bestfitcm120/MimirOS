import { motion } from 'framer-motion'
import { AlertTriangle, Clock, CheckSquare, FileText, Mail, Zap, TrendingUp, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockTasks, mockProjects, mockFiles, mockNotifications } from '@/data/mockData'
import { formatDistanceToNow, isPast, isToday, format } from 'date-fns'
import type { Task } from '@/types'

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    urgent: 'bg-danger',
    high: 'bg-warning',
    medium: 'bg-info',
    low: 'bg-text-dim',
  }
  return <span className={`status-dot ${colors[priority] || 'bg-text-dim'}`} />
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'done') return <CheckSquare size={13} className="text-success" />
  if (status === 'blocked') return <AlertTriangle size={13} className="text-danger" />
  if (status === 'in_progress') return <Clock size={13} className="text-info" />
  return <CheckSquare size={13} className="text-text-dim" />
}

function TaskRow({ task }: { task: Task }) {
  const { setSelectedNode } = useUIStore()
  const isOverdue = task.due_date && isPast(new Date(task.due_date)) && task.status !== 'done'
  const project = mockProjects.find(p => p.id === task.project_id)

  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={() => setSelectedNode({ id: task.id, nodeType: 'task', title: task.title })}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-elevated/60 transition-colors text-left group"
    >
      <StatusIcon status={task.status} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate ${task.status === 'done' ? 'line-through text-text-dim' : 'text-text-primary'}`}>
          {task.title}
        </p>
        {project && (
          <p className="text-2xs text-text-dim truncate mt-0.5">{project.name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <PriorityDot priority={task.priority} />
        {task.due_date && (
          <span className={`text-2xs ${isOverdue ? 'text-danger' : 'text-text-dim'}`}>
            {isOverdue ? 'OVERDUE' : isToday(new Date(task.due_date)) ? format(new Date(task.due_date), 'HH:mm') : format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
    </motion.button>
  )
}

const calendarEvents = [
  { time: '09:00', title: 'Supervisor meeting', type: 'meeting' },
  { time: '14:00', title: 'Arduino lab session', type: 'lab' },
  { time: '16:30', title: 'Thermo report deadline', type: 'deadline' },
]

const followUps = [
  { person: 'NovaTech HR', subject: 'Reply to application', age: '3 days overdue', urgent: true },
  { person: 'Prof. Karim', subject: 'Assignment clarification', age: 'Today', urgent: false },
  { person: 'Siemens Recruiter', subject: 'Send portfolio', age: 'Tomorrow', urgent: false },
]

export default function DailyView() {
  const { setSelectedNode, setMode } = useUIStore()

  const activeTasks = mockTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled')
  const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || (t.due_date && isToday(new Date(t.due_date))))
  const overdueTasks = activeTasks.filter(t => t.due_date && isPast(new Date(t.due_date)))
  const blockedTasks = activeTasks.filter(t => t.status === 'blocked')

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-4">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-lg font-semibold text-text-primary">
              {format(new Date(), 'EEEE, d MMMM')}
            </h1>
            <p className="text-xs text-text-dim mt-0.5">
              {overdueTasks.length > 0 && <span className="text-danger">{overdueTasks.length} overdue · </span>}
              {urgentTasks.length} urgent · {activeTasks.length} total open
            </p>
          </div>
          <div className="flex gap-2">
            {overdueTasks.length > 0 && (
              <span className="tag bg-danger/10 text-danger border border-danger/20">
                {overdueTasks.length} overdue
              </span>
            )}
            {blockedTasks.length > 0 && (
              <span className="tag bg-warning/10 text-warning border border-warning/20">
                {blockedTasks.length} blocked
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Briefing */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel-elevated border-accent/20 p-3 mb-4 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-accent rounded-l-lg" />
        <div className="flex items-start gap-2 pl-2">
          <Zap size={14} className="text-accent mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-2xs font-semibold text-accent uppercase tracking-wider mb-1">AI Briefing</p>
            <p className="text-xs text-text-secondary leading-relaxed">
              You have <span className="text-warning font-medium">2 urgent deadlines today</span> — the thermodynamics report (16:30) and PCB schematic review.
              The NovaTech follow-up is <span className="text-danger font-medium">3 days overdue</span>. Garden Guardian has 3 new files
              from yesterday. <span className="text-success font-medium">Focus on report first.</span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Priority Queue */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="panel p-3"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-primary flex items-center gap-2">
              <TrendingUp size={13} className="text-accent" /> Priority Queue
            </h2>
            <button onClick={() => setMode('daily')} className="text-text-dim hover:text-text-secondary">
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-0.5">
            {activeTasks
              .sort((a, b) => {
                const p = { urgent: 0, high: 1, medium: 2, low: 3 }
                return (p[a.priority] || 2) - (p[b.priority] || 2)
              })
              .slice(0, 6)
              .map(task => <TaskRow key={task.id} task={task} />)}
          </div>
        </motion.div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel p-3"
        >
          <h2 className="text-xs font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Clock size={13} className="text-info" /> Today's Calendar
          </h2>
          <div className="space-y-2">
            {calendarEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-elevated/50">
                <div className="text-xs font-mono text-text-dim w-12 flex-shrink-0">{ev.time}</div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.type === 'deadline' ? 'bg-danger' : ev.type === 'lab' ? 'bg-info' : 'bg-success'}`} />
                <span className="text-sm text-text-secondary">{ev.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-2xs text-text-dim">Next: Supervisor meeting at 09:00</p>
          </div>
        </motion.div>

        {/* Recent Files */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="panel p-3"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-text-primary flex items-center gap-2">
              <FileText size={13} className="text-text-secondary" /> Recent Files
            </h2>
            <button onClick={() => setMode('files')} className="text-text-dim hover:text-text-secondary">
              <ChevronRight size={13} />
            </button>
          </div>
          <div className="space-y-1.5">
            {mockFiles.slice(0, 5).map(f => {
              const project = mockProjects.find(p => p.id === f.project_id)
              return (
                <div key={f.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-elevated cursor-pointer transition-colors">
                  <div className={`w-6 h-6 rounded flex items-center justify-center text-2xs font-mono flex-shrink-0 ${
                    f.file_type === 'code' ? 'bg-info/10 text-info' :
                    f.file_type === 'pdf' ? 'bg-danger/10 text-danger' :
                    'bg-text-dim/10 text-text-dim'
                  }`}>
                    {f.file_type === 'code' ? '</>' : f.file_type === 'pdf' ? 'PDF' : f.file_type?.slice(0,3).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary truncate">{f.filename}</p>
                    {project && <p className="text-2xs text-text-dim truncate">{project.name}</p>}
                  </div>
                  <span className="text-2xs text-text-dim flex-shrink-0">v{f.version}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Follow-ups */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="panel p-3"
        >
          <h2 className="text-xs font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Mail size={13} className="text-warning" /> Follow-ups
          </h2>
          <div className="space-y-2">
            {followUps.map((f, i) => (
              <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border ${f.urgent ? 'border-danger/20 bg-danger/5' : 'border-border bg-elevated/50'}`}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-2xs font-semibold ${f.urgent ? 'bg-danger/20 text-danger' : 'bg-elevated text-text-muted'}`}>
                  {f.person[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-secondary font-medium">{f.person}</p>
                  <p className="text-2xs text-text-dim truncate">{f.subject}</p>
                </div>
                <span className={`text-2xs flex-shrink-0 ${f.urgent ? 'text-danger' : 'text-text-dim'}`}>{f.age}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active projects strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mt-4 panel p-3"
      >
        <h2 className="text-xs font-semibold text-text-primary mb-3">Active Projects</h2>
        <div className="grid grid-cols-2 gap-3">
          {mockProjects.filter(p => p.status === 'active').map(p => (
            <button
              key={p.id}
              onClick={() => { setSelectedNode({ id: p.id, nodeType: 'project', title: p.name }); setMode('engineering') }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border hover:border-border-bright bg-elevated/50 hover:bg-elevated transition-all text-left"
            >
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{p.name}</p>
                <p className="text-2xs text-text-dim truncate">{p.phase || p.type}</p>
              </div>
              <span className={`status-dot flex-shrink-0 ${p.status === 'active' ? 'bg-success' : 'bg-text-dim'}`} />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
