import { Search, Bell, Settings, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Zap } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockNotifications } from '@/data/mockData'
import type { Mode } from '@/types'

const MODES: { id: Mode; label: string; shortcut: string }[] = [
  { id: 'daily', label: 'Daily', shortcut: '1' },
  { id: 'graph', label: 'Memory', shortcut: '2' },
  { id: 'engineering', label: 'Engineering', shortcut: '3' },
  { id: 'agents', label: 'Agents', shortcut: '4' },
  { id: 'workflows', label: 'Workflows', shortcut: '5' },
  { id: 'files', label: 'Files', shortcut: '6' },
  { id: 'timeline', label: 'Timeline', shortcut: '7' },
]

export default function TopBar() {
  const { activeMode, setMode, setCommandBarOpen, sidebarCollapsed, setSidebarCollapsed, inspectorCollapsed, setInspectorCollapsed } = useUIStore()
  const unreadCount = mockNotifications.filter(n => !n.is_read).length

  return (
    <header className="flex-shrink-0 h-12 border-b border-border bg-surface flex items-center px-3 gap-3 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="btn-ghost p-1.5 rounded">
          {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </button>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded bg-accent flex items-center justify-center">
            <Zap size={13} className="text-white" fill="white" />
          </div>
          <span className="font-display font-semibold text-sm text-text-primary tracking-tight">AIOS</span>
        </div>
      </div>

      {/* Mode tabs */}
      <nav className="flex items-center gap-0.5 flex-shrink-0">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all duration-150 ${
              activeMode === m.id
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'text-text-muted hover:text-text-secondary hover:bg-elevated'
            }`}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {/* Command bar trigger */}
      <button
        onClick={() => setCommandBarOpen(true)}
        className="flex-1 max-w-md flex items-center gap-2 px-3 py-1.5 bg-elevated border border-border rounded-md text-text-muted text-xs hover:border-border-bright hover:text-text-secondary transition-colors"
      >
        <Search size={13} />
        <span className="flex-1 text-left">Search or type a command...</span>
        <kbd className="hidden sm:flex items-center gap-1 text-2xs bg-surface px-1.5 py-0.5 rounded border border-border">
          <span>⌘</span><span>K</span>
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <button className="btn-ghost p-1.5 rounded relative">
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-danger text-white text-2xs rounded-full flex items-center justify-center font-medium">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Settings */}
        <button className="btn-ghost p-1.5 rounded">
          <Settings size={15} />
        </button>

        {/* Inspector toggle */}
        <button onClick={() => setInspectorCollapsed(!inspectorCollapsed)} className="btn-ghost p-1.5 rounded">
          {inspectorCollapsed ? <PanelRightOpen size={15} /> : <PanelRightClose size={15} />}
        </button>

        {/* User avatar */}
        <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-semibold ml-1">
          U
        </div>
      </div>
    </header>
  )
}
