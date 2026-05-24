import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Folder, CheckSquare, FileText, Bot, Workflow, Clock, Zap } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockProjects, mockTasks, mockFiles } from '@/data/mockData'

interface CommandResult {
  id: string
  icon: React.ReactNode
  label: string
  sublabel?: string
  action: () => void
  category: string
}

const QUICK_ACTIONS = [
  { label: 'Open Daily Dashboard', icon: <Zap size={14} />, mode: 'daily' as const },
  { label: 'Open Memory Graph', icon: <Folder size={14} />, mode: 'graph' as const },
  { label: 'Open Agent Console', icon: <Bot size={14} />, mode: 'agents' as const },
  { label: 'Open Workflows', icon: <Workflow size={14} />, mode: 'workflows' as const },
  { label: 'Open Files', icon: <FileText size={14} />, mode: 'files' as const },
  { label: 'Open Timeline', icon: <Clock size={14} />, mode: 'timeline' as const },
]

export default function CommandBar() {
  const { commandBarOpen, setCommandBarOpen, setMode, setSelectedNode, setActiveProjectId } = useUIStore()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (commandBarOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelected(0)
    }
  }, [commandBarOpen])

  const buildResults = (): CommandResult[] => {
    if (!query) {
      return QUICK_ACTIONS.map(a => ({
        id: a.label,
        icon: a.icon,
        label: a.label,
        category: 'Navigation',
        action: () => { setMode(a.mode); setCommandBarOpen(false) },
      }))
    }

    const q = query.toLowerCase()
    const results: CommandResult[] = []

    mockProjects
      .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .forEach(p => results.push({
        id: p.id,
        icon: <Folder size={14} style={{ color: p.color }} />,
        label: p.name,
        sublabel: `${p.type} · ${p.status}`,
        category: 'Projects',
        action: () => {
          setActiveProjectId(p.id)
          setMode('engineering')
          setSelectedNode({ id: p.id, nodeType: 'project', title: p.name })
          setCommandBarOpen(false)
        },
      }))

    mockTasks
      .filter(t => t.title.toLowerCase().includes(q))
      .forEach(t => results.push({
        id: t.id,
        icon: <CheckSquare size={14} className={t.status === 'done' ? 'text-success' : t.status === 'blocked' ? 'text-danger' : 'text-warning'} />,
        label: t.title,
        sublabel: `Task · ${t.status} · ${t.priority}`,
        category: 'Tasks',
        action: () => {
          setSelectedNode({ id: t.id, nodeType: 'task', title: t.title })
          setMode('daily')
          setCommandBarOpen(false)
        },
      }))

    mockFiles
      .filter(f => f.filename.toLowerCase().includes(q))
      .forEach(f => results.push({
        id: f.id,
        icon: <FileText size={14} className="text-text-secondary" />,
        label: f.filename,
        sublabel: `File · ${f.file_type}`,
        category: 'Files',
        action: () => {
          setMode('files')
          setCommandBarOpen(false)
        },
      }))

    // NLP-style shortcuts
    if (q.includes('today') || q.includes('daily') || q.includes('plan')) {
      results.unshift({ id: 'daily', icon: <Zap size={14} className="text-accent" />, label: 'Open Daily Dashboard', category: 'Quick', action: () => { setMode('daily'); setCommandBarOpen(false) } })
    }
    if (q.includes('graph') || q.includes('memory') || q.includes('connect')) {
      results.unshift({ id: 'graph', icon: <Folder size={14} className="text-agent" />, label: 'Open Memory Graph', category: 'Quick', action: () => { setMode('graph'); setCommandBarOpen(false) } })
    }
    if (q.includes('agent') || q.includes('bot') || q.includes('ai')) {
      results.unshift({ id: 'agents', icon: <Bot size={14} className="text-agent" />, label: 'Open Agent Console', category: 'Quick', action: () => { setMode('agents'); setCommandBarOpen(false) } })
    }

    return results.slice(0, 8)
  }

  const results = buildResults()

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
    if (e.key === 'Enter' && results[selected]) { results[selected].action() }
    if (e.key === 'Escape') setCommandBarOpen(false)
  }

  return (
    <AnimatePresence>
      {commandBarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setCommandBarOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
          >
            <div className="bg-elevated border border-border-bright rounded-xl shadow-glow-accent overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search size={16} className="text-text-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSelected(0) }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, tasks, files... or type a command"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-dim outline-none"
                />
                <kbd className="text-2xs text-text-dim border border-border px-1.5 py-0.5 rounded">ESC</kbd>
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="py-1 max-h-80 overflow-y-auto">
                  {results.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={r.action}
                      onMouseEnter={() => setSelected(i)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        i === selected ? 'bg-accent/10 text-text-primary' : 'text-text-secondary hover:bg-elevated/50'
                      }`}
                    >
                      <span className={i === selected ? 'text-accent' : 'text-text-dim'}>{r.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{r.label}</p>
                        {r.sublabel && <p className="text-2xs text-text-dim">{r.sublabel}</p>}
                      </div>
                      {i === selected && <ArrowRight size={13} className="text-accent flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}

              {/* Footer hint */}
              <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-2xs text-text-dim">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>ESC close</span>
                <span className="ml-auto">Try: "Garden Guardian", "overdue tasks", "open agents"</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
