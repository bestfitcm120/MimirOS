import React, { useEffect } from 'react'
import { useStore } from '../../stores/useStore'
import { CheckCircle, Clock, AlertTriangle, Zap, Calendar, ChevronRight, TrendingUp } from 'lucide-react'

export default function DailyDashboard() {
  const { dashboard, setSelectedNode, completeTask } = useStore()

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => useStore.getState().setDashboard(data))
      .catch(console.error)
  }, [])

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-nexus-text/30">Loading dashboard...</div>
      </div>
    )
  }

  const { today_tasks, overdue_tasks, active_projects, pending_approvals } = dashboard

  const stats = [
    { label: 'Today', value: today_tasks.length, icon: Calendar, color: 'text-nexus-accent' },
    { label: 'Overdue', value: overdue_tasks.length, icon: AlertTriangle, color: 'text-nexus-urgent' },
    { label: 'Projects', value: active_projects.length, icon: Zap, color: 'text-nexus-project' },
    { label: 'Approvals', value: pending_approvals, icon: Clock, color: 'text-nexus-pending' },
  ]

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nexus-text">Daily Command Center</h1>
          <p className="text-sm text-nexus-text/50 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          {stats.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="panel p-3 min-w-[100px]">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={14} className={stat.color} />
                  <span className="text-[10px] uppercase tracking-wider text-nexus-text/40">{stat.label}</span>
                </div>
                <div className="text-xl font-bold text-nexus-text">{stat.value}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today's Priorities */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Calendar size={14} className="text-nexus-accent" />
              Today's Priorities
            </h2>
            <button className="text-[10px] text-nexus-accent hover:underline">View All</button>
          </div>
          <div className="space-y-2">
            {today_tasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
                onClick={() => setSelectedNode({ id: task.id, type: 'task', data: task })}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); completeTask(task.id) }}
                  className="w-5 h-5 rounded border border-nexus-text/30 flex items-center justify-center hover:border-nexus-success hover:bg-nexus-success/20 transition-colors"
                >
                  {task.status === 'completed' && <CheckCircle size={12} className="text-nexus-success" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${task.status === 'completed' ? 'line-through text-nexus-text/40' : 'text-nexus-text'}`}>
                    {task.title}
                  </p>
                  {task.project_id && (
                    <p className="text-[10px] text-nexus-text/40 mt-0.5">Project ID: {task.project_id.slice(0, 8)}</p>
                  )}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  task.priority <= 2 ? 'bg-nexus-urgent/20 text-nexus-urgent' : 
                  task.priority === 3 ? 'bg-nexus-pending/20 text-nexus-pending' : 
                  'bg-nexus-text/10 text-nexus-text/60'
                }`}>
                  P{task.priority}
                </span>
              </div>
            ))}
            {today_tasks.length === 0 && (
              <p className="text-sm text-nexus-text/30 italic py-4 text-center">No tasks scheduled for today</p>
            )}
          </div>
        </div>

        {/* Overdue */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle size={14} className="text-nexus-urgent" />
              Overdue
            </h2>
            <span className="text-[10px] bg-nexus-urgent/20 text-nexus-urgent px-2 py-0.5 rounded">{overdue_tasks.length} items</span>
          </div>
          <div className="space-y-2">
            {overdue_tasks.map(task => (
              <div 
                key={task.id}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-nexus-urgent/5 border border-nexus-urgent/20 hover:bg-nexus-urgent/10 transition-colors cursor-pointer"
                onClick={() => setSelectedNode({ id: task.id, type: 'task', data: task })}
              >
                <AlertTriangle size={14} className="text-nexus-urgent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-nexus-text truncate">{task.title}</p>
                  <p className="text-[10px] text-nexus-urgent/70">
                    Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'unknown'}
                  </p>
                </div>
                <ChevronRight size={14} className="text-nexus-text/30" />
              </div>
            ))}
            {overdue_tasks.length === 0 && (
              <p className="text-sm text-nexus-text/30 italic py-4 text-center">Nothing overdue!</p>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Zap size={14} className="text-nexus-project" />
              Active Projects
            </h2>
          </div>
          <div className="space-y-2">
            {active_projects.map(project => (
              <div 
                key={project.id}
                className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setSelectedNode({ id: project.id, type: 'project', data: project })}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-nexus-text">{project.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-nexus-project/20 text-nexus-project rounded capitalize">
                    {project.project_type}
                  </span>
                </div>
                <p className="text-xs text-nexus-text/50 line-clamp-2">{project.description || 'No description'}</p>
                {project.current_phase && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <TrendingUp size={10} className="text-nexus-accent" />
                    <span className="text-[10px] text-nexus-accent">{project.current_phase}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Zap size={14} className="text-nexus-agent" />
              Suggested Actions
            </h2>
          </div>
          <div className="space-y-2">
            {overdue_tasks.length > 0 && (
              <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <p className="text-xs text-nexus-text">Follow up on {overdue_tasks[0]?.title}</p>
                <p className="text-[10px] text-nexus-text/40 mt-1">This task is overdue and may be blocking other work</p>
              </button>
            )}
            <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <p className="text-xs text-nexus-text">Review active project statuses</p>
              <p className="text-[10px] text-nexus-text/40 mt-1">{active_projects.length} projects need attention</p>
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <p className="text-xs text-nexus-text">Organize recent files</p>
              <p className="text-[10px] text-nexus-text/40 mt-1">New uploads detected in inbox</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
