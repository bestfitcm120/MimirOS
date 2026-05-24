import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, Search, FileText, Code, File, Grid, List, Link } from 'lucide-react'
import { mockFiles, mockProjects } from '@/data/mockData'
import type { FileRecord } from '@/types'

const FILE_ICONS: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pdf: { icon: <FileText size={16} />, color: 'text-danger', bg: 'bg-danger/10' },
  code: { icon: <Code size={16} />, color: 'text-info', bg: 'bg-info/10' },
  docx: { icon: <FileText size={16} />, color: 'text-info', bg: 'bg-info/10' },
  spreadsheet: { icon: <File size={16} />, color: 'text-success', bg: 'bg-success/10' },
  cad: { icon: <File size={16} />, color: 'text-engineering', bg: 'bg-engineering/10' },
  image: { icon: <File size={16} />, color: 'text-agent', bg: 'bg-agent/10' },
}

function fileSize(bytes?: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function FileCard({ file }: { file: FileRecord }) {
  const project = mockProjects.find(p => p.id === file.project_id)
  const icons = FILE_ICONS[file.file_type || ''] || { icon: <File size={16} />, color: 'text-text-dim', bg: 'bg-elevated' }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="panel p-3 cursor-pointer hover:border-border-bright transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${icons.bg} ${icons.color}`}>
          {icons.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
            {file.filename}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {project && (
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="text-2xs text-text-dim truncate">{project.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-2xs text-text-dim">{fileSize(file.file_size_bytes)}</span>
            <span className="text-2xs text-text-dim">v{file.version}</span>
            {project && (
              <span className="text-2xs text-accent flex items-center gap-0.5">
                <Link size={9} /> linked
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function FileRow({ file }: { file: FileRecord }) {
  const project = mockProjects.find(p => p.id === file.project_id)
  const icons = FILE_ICONS[file.file_type || ''] || { icon: <File size={13} />, color: 'text-text-dim', bg: 'bg-elevated' }

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-elevated/60 cursor-pointer transition-colors border border-transparent hover:border-border">
      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${icons.bg} ${icons.color}`}>
        {icons.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary truncate">{file.filename}</p>
      </div>
      <div className="flex items-center gap-4 text-2xs text-text-dim flex-shrink-0">
        {project && (
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: project.color }} />
            <span>{project.name}</span>
          </div>
        )}
        <span className="w-16 text-right">{fileSize(file.file_size_bytes)}</span>
        <span className="w-8">v{file.version}</span>
        <span className="text-2xs text-text-dim">{file.file_type || '—'}</span>
      </div>
    </div>
  )
}

export default function FilesView() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredFiles = mockFiles.filter(f => {
    const matchSearch = !searchQuery || f.filename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchType = filterType === 'all' || f.file_type === filterType
    const matchProject = filterProject === 'all' || f.project_id === filterProject
    return matchSearch && matchType && matchProject
  })

  const fileTypes = [...new Set(mockFiles.map(f => f.file_type).filter(Boolean))]

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-sm font-semibold text-text-primary">Files</h2>

          <div className="flex items-center gap-2 px-2.5 py-1 bg-elevated border border-border rounded text-xs text-text-muted">
            <Search size={12} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-transparent outline-none text-text-secondary placeholder:text-text-dim w-36"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-2.5 py-1 bg-elevated border border-border rounded text-xs text-text-secondary outline-none"
          >
            <option value="all">All types</option>
            {fileTypes.map(t => <option key={t} value={t!}>{t}</option>)}
          </select>

          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="px-2.5 py-1 bg-elevated border border-border rounded text-xs text-text-secondary outline-none"
          >
            <option value="all">All projects</option>
            {mockProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-accent/20 text-accent' : 'text-text-dim hover:text-text-secondary'}`}
              >
                <Grid size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-accent/20 text-accent' : 'text-text-dim hover:text-text-secondary'}`}
              >
                <List size={13} />
              </button>
            </div>

            <input ref={fileInputRef} type="file" className="hidden" multiple />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary text-xs"
            >
              <Upload size={12} /> Upload
            </button>
          </div>
        </div>
      </div>

      {/* File count */}
      <div className="px-4 py-2 border-b border-border/50">
        <p className="text-2xs text-text-dim">{filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-elevated border border-border flex items-center justify-center">
              <FileText size={20} className="text-text-dim" />
            </div>
            <p className="text-sm text-text-dim">No files found</p>
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary text-xs">
              <Upload size={12} /> Upload your first file
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredFiles.map(f => <FileCard key={f.id} file={f} />)}
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className="flex items-center gap-3 px-3 py-1.5 text-2xs text-text-dim font-semibold uppercase tracking-wider border-b border-border mb-1">
              <div className="w-7" />
              <span className="flex-1">Name</span>
              <div className="flex items-center gap-4 flex-shrink-0">
                <span className="w-28">Project</span>
                <span className="w-16 text-right">Size</span>
                <span className="w-8">Ver</span>
                <span>Type</span>
              </div>
            </div>
            {filteredFiles.map(f => <FileRow key={f.id} file={f} />)}
          </div>
        )}
      </div>
    </div>
  )
}
