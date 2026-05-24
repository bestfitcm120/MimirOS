import React, { useEffect } from 'react'
import { useStore } from '../../stores/useStore'
import { Activity, AlertTriangle, FileText, Folder, MessageSquare, Clock } from 'lucide-react'

export default function LeftPanel() {
  const { dashboard, tasks, projects, setSelectedNode, currentMode } = useStore()

  const todayTasks = dashboard?.today_tasks || []
  const overdueTasks = dashboard?.overdue_tasks || []
  const activeProjects = dashboard?.active_projects || []
  const recentEvents = dashboard?.recent_events || []

  const blockedTasks = tasks.filter(t => t.status === 'blocked')

  return (
    <aside className="w-64 bg-nexus-bg border-r border-white/5 flex flex-col overflow-hidden">
      {/* Activity Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">

        {/* Stuck / Blocked */}
        {blockedTasks.length > 0 && (
          <div className="panel p-2.5 border-l-2 border-l-nexus-urgent">
            <div className="flex items-center gap-2 mb-2 text-nexus-urgent">
              <AlertTriangle size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Blocked</span>
            </div>
            <div className="space-y-1.5">
              {blockedTasks.slice(0, 3).map(task => (
                <button 
                  key={task.id}
                  onClick={() => setSelectedNode({ id: task.id, type: 'task', data: task })}
                  className="w-full text-left text-xs text-nexus-text/80 hover:text-nexus-text truncate py-0.5"
                >
                  {task.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Today's Tasks */}
        <div className="panel p-2.5">
          <div className="flex items-center gap-2 mb-2 text-nexus-accent">
            <Clock size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Today</span>
            <span className="ml-auto text-[10px] bg-nexus-accent/20 px-1.5 rounded">{todayTasks.length}</span>
          </div>
          <div className="space-y-1.5">
            {todayTasks.slice(0, 5).map(task => (
              <button 
                key={task.id}
                onClick={() => setSelectedNode({ id: task.id, type: 'task', data: task })}
                className="w-full flex items-center gap-2 text-left text-xs text-nexus-text/80 hover:text-nexus-text py-0.5 group"
              >
                <span className={`status-dot ${task.status === 'completed' ? 'status-success' : task.status === 'blocked' ? 'status-blocked' : 'status-pending'}`} />
                <span className="truncate flex-1">{task.title}</span>
              </button>
            ))}
            {todayTasks.length === 0 && (
              <p className="text-xs text-nexus-text/40 italic">No tasks due today</p>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className="panel p-2.5">
          <div className="flex items-center gap-2 mb-2 text-nexus-project">
            <Folder size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
          </div>
          <div className="space-y-1.5">
            {activeProjects.slice(0, 5).map(project => (
              <button 
                key={project.id}
                onClick={() => setSelectedNode({ id: project.id, type: 'project', data: project })}
                className="w-full text-left text-xs text-nexus-text/80 hover:text-nexus-text truncate py-0.5"
              >
                {project.title}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="panel p-2.5">
          <div className="flex items-center gap-2 mb-2 text-nexus-text/60">
            <Activity size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">Activity</span>
          </div>
          <div className="space-y-2">
            {recentEvents.slice(0, 5).map(event => (
              <div key={event.id} className="text-xs text-nexus-text/50">
                <div className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-nexus-border" />
                  <span className="truncate">{event.event_type}</span>
                </div>
                <p className="truncate pl-2.5 text-nexus-text/30">{event.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
