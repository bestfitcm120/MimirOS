import React, { useState } from 'react'
import { useStore } from '../../stores/useStore'
import { Search, Bell, Zap, User, Command, Plus, Upload, Folder, Cpu, Brain, Workflow, FileText, Clock } from 'lucide-react'

const MODES = [
  { id: 'daily', label: 'Daily', icon: Command, color: 'text-nexus-accent' },
  { id: 'engineering', label: 'Engineering', icon: Cpu, color: 'text-nexus-engineering' },
  { id: 'graph', label: 'Memory Graph', icon: Brain, color: 'text-nexus-agent' },
  { id: 'agents', label: 'Agents', icon: Zap, color: 'text-nexus-project' },
  { id: 'workflows', label: 'Workflows', icon: Workflow, color: 'text-nexus-person' },
  { id: 'files', label: 'Files', icon: FileText, color: 'text-nexus-text' },
  { id: 'timeline', label: 'Timeline', icon: Clock, color: 'text-nexus-text' },
]

export default function TopBar() {
  const { currentMode, setMode, toggleCommandBar, dashboard } = useStore()
  const [showModeMenu, setShowModeMenu] = useState(false)

  const pendingApprovals = dashboard?.pending_approvals || 0

  return (
    <header className="h-14 bg-nexus-bg/80 backdrop-blur-md border-b border-white/5 flex items-center px-4 gap-3 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 min-w-fit">
        <div className="w-7 h-7 rounded bg-gradient-to-br from-nexus-accent to-nexus-project flex items-center justify-center">
          <Zap size={16} className="text-nexus-bg" />
        </div>
        <span className="font-bold text-sm tracking-wide text-nexus-accent">NEXUS</span>
      </div>

      {/* Command Bar */}
      <button 
        onClick={toggleCommandBar}
        className="flex-1 max-w-xl mx-4 flex items-center gap-2 px-3 py-1.5 bg-nexus-surface/60 border border-white/10 rounded-md text-sm text-nexus-text/50 hover:text-nexus-text hover:border-nexus-border/40 transition-all"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Universal command...</span>
        <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-xs font-mono">/</kbd>
      </button>

      {/* Mode Selector */}
      <div className="relative">
        <button 
          onClick={() => setShowModeMenu(!showModeMenu)}
          className="flex items-center gap-2 px-3 py-1.5 bg-nexus-surface/60 border border-white/10 rounded-md text-sm hover:border-nexus-border/40 transition-all"
        >
          {(() => {
            const mode = MODES.find(m => m.id === currentMode)
            const Icon = mode?.icon || Command
            return <Icon size={14} className={mode?.color || ''} />
          })()}
          <span className="capitalize">{currentMode}</span>
        </button>

        {showModeMenu && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-nexus-surface border border-white/10 rounded-lg shadow-xl z-50 py-1">
            {MODES.map(mode => {
              const Icon = mode.icon
              return (
                <button
                  key={mode.id}
                  onClick={() => { setMode(mode.id); setShowModeMenu(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${currentMode === mode.id ? 'bg-white/5' : ''}`}
                >
                  <Icon size={14} className={mode.color} />
                  <span>{mode.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="New Task">
          <Plus size={16} />
        </button>
        <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="Upload File">
          <Upload size={16} />
        </button>
        <button className="p-1.5 hover:bg-white/5 rounded transition-colors" title="New Project">
          <Folder size={16} />
        </button>
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 hover:bg-white/5 rounded transition-colors">
        <Bell size={16} />
        {pendingApprovals > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-nexus-urgent rounded-full text-[10px] flex items-center justify-center font-bold">
            {pendingApprovals}
          </span>
        )}
      </button>

      {/* User */}
      <button className="p-1.5 hover:bg-white/5 rounded transition-colors">
        <User size={16} />
      </button>
    </header>
  )
}
