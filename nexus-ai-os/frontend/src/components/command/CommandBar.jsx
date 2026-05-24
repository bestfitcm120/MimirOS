import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../../stores/useStore'
import { Search, X, Command, Folder, CheckSquare, FileText, Brain, Zap, ArrowRight } from 'lucide-react'

const COMMAND_TYPES = [
  { prefix: 'open', label: 'Open Project', icon: Folder, color: 'text-nexus-project' },
  { prefix: 'task', label: 'Create Task', icon: CheckSquare, color: 'text-nexus-success' },
  { prefix: 'find', label: 'Find File', icon: FileText, color: 'text-nexus-text' },
  { prefix: 'search', label: 'Search Memory', icon: Brain, color: 'text-nexus-agent' },
  { prefix: 'run', label: 'Run Agent', icon: Zap, color: 'text-nexus-accent' },
]

export default function CommandBar() {
  const { commandBarOpen, toggleCommandBar, setMode } = useStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (commandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandBarOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        toggleCommandBar()
      }
      if (e.key === 'Escape' && commandBarOpen) {
        toggleCommandBar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [commandBarOpen, toggleCommandBar])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      const res = await fetch('/api/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: query })
      })
      const data = await res.json()

      if (data.target_type) {
        setMode(data.target_type === 'project' ? 'engineering' : data.target_type)
      }
      toggleCommandBar()
      setQuery('')
    } catch (err) {
      console.error(err)
    }
  }

  if (!commandBarOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={toggleCommandBar} />

      <div className="relative w-full max-w-2xl bg-nexus-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-nexus-text/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need to do?"
            className="flex-1 bg-transparent text-sm text-nexus-text placeholder:text-nexus-text/30 outline-none"
          />
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] font-mono text-nexus-text/40">ESC</kbd>
        </form>

        <div className="p-2">
          <div className="text-[10px] uppercase tracking-wider text-nexus-text/30 px-2 py-1.5">
            Quick Actions
          </div>
          <div className="space-y-0.5">
            {COMMAND_TYPES.map(type => {
              const Icon = type.icon
              return (
                <button
                  key={type.prefix}
                  onClick={() => { setQuery(type.prefix + ' '); inputRef.current?.focus() }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-left transition-colors group"
                >
                  <Icon size={16} className={type.color} />
                  <div className="flex-1">
                    <div className="text-xs text-nexus-text">{type.label}</div>
                    <div className="text-[10px] text-nexus-text/40">Type “{type.prefix} ...”</div>
                  </div>
                  <ArrowRight size={14} className="text-nexus-text/20 group-hover:text-nexus-text/60 transition-colors" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
