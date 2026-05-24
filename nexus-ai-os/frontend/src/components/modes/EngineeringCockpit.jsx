import React, { useState } from 'react'
import { useStore } from '../../stores/useStore'
import { Cpu, FileText, Calculator, Code, GitBranch, AlertTriangle, CheckCircle, BookOpen, Layers, Settings, ChevronRight } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Layers },
  { id: 'requirements', label: 'Requirements', icon: BookOpen },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'calculations', label: 'Calculations', icon: Calculator },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'decisions', label: 'Decisions', icon: GitBranch },
  { id: 'failures', label: 'Tests & Failures', icon: AlertTriangle },
  { id: 'output', label: 'Output', icon: CheckCircle },
]

export default function EngineeringCockpit() {
  const { projects, selectedNode, setSelectedNode } = useStore()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState(null)

  const project = selectedProject ? projects.find(p => p.id === selectedProject) : projects[0]

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-nexus-text/40">
        <div className="text-center">
          <Cpu size={48} className="mx-auto mb-4 opacity-30" />
          <h2 className="text-xl font-semibold mb-2">No Engineering Projects</h2>
          <p className="text-sm">Create a project to start tracking engineering work</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Header */}
      <div className="h-14 border-b border-white/5 flex items-center px-4 gap-4">
        <select 
          value={project.id}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="bg-nexus-surface border border-white/10 rounded px-3 py-1.5 text-sm text-nexus-text outline-none focus:border-nexus-border"
        >
          {projects.filter(p => p.project_type === 'engineering').map(p => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-xs text-nexus-text/50">
          <span className="px-2 py-0.5 bg-nexus-project/20 text-nexus-project rounded">{project.status}</span>
          <span>{project.current_phase || 'No phase set'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-nexus-accent text-nexus-accent' 
                  : 'border-transparent text-nexus-text/50 hover:text-nexus-text'
              }`}
            >
              <Icon size={14} />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-lg font-semibold text-nexus-text mb-2">{project.title}</h3>
              <p className="text-sm text-nexus-text/60 leading-relaxed">{project.description || 'No description provided.'}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="panel p-3">
                <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Status</span>
                <span className="text-sm font-medium text-nexus-project capitalize">{project.status}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Phase</span>
                <span className="text-sm font-medium text-nexus-accent">{project.current_phase || '—'}</span>
              </div>
              <div className="panel p-3">
                <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Priority</span>
                <span className="text-sm font-medium">P{project.priority}</span>
              </div>
            </div>

            <div className="panel p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle size={14} className="text-nexus-success" />
                Next Actions
              </h4>
              <div className="space-y-2">
                <button className="w-full text-left p-2.5 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-nexus-text/30 group-hover:text-nexus-accent transition-colors" />
                  <span className="text-xs text-nexus-text">Define project requirements</span>
                </button>
                <button className="w-full text-left p-2.5 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-nexus-text/30 group-hover:text-nexus-accent transition-colors" />
                  <span className="text-xs text-nexus-text">Upload reference documents</span>
                </button>
                <button className="w-full text-left p-2.5 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 group">
                  <ChevronRight size={14} className="text-nexus-text/30 group-hover:text-nexus-accent transition-colors" />
                  <span className="text-xs text-nexus-text">Create first design decision</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requirements' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Project Requirements</h3>
              <textarea 
                className="w-full h-48 bg-nexus-bg border border-white/10 rounded p-3 text-sm text-nexus-text placeholder:text-nexus-text/30 outline-none focus:border-nexus-border resize-none"
                placeholder="Enter design requirements, constraints, deliverables..."
              />
              <div className="mt-3 flex justify-end">
                <button className="btn-primary text-xs">Save Requirements</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Project Files</h3>
              <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-white/20 transition-colors cursor-pointer">
                <FileText size={24} className="mx-auto mb-2 text-nexus-text/30" />
                <p className="text-sm text-nexus-text/50">Drop files here or click to upload</p>
                <p className="text-xs text-nexus-text/30 mt-1">PDF, CAD, Code, Images supported</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calculations' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Calculations</h3>
              <p className="text-sm text-nexus-text/50">Calculation tracking coming in Phase 4</p>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Code Repository</h3>
              <p className="text-sm text-nexus-text/50">Code browser and debugger coming in Phase 5</p>
            </div>
          </div>
        )}

        {activeTab === 'decisions' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Design Decisions</h3>
              <div className="space-y-3">
                <div className="p-3 rounded bg-white/5 border-l-2 border-l-nexus-decision">
                  <p className="text-xs text-nexus-text/70">No decisions recorded yet</p>
                </div>
              </div>
              <button className="mt-3 btn-primary text-xs">Log Decision</button>
            </div>
          </div>
        )}

        {activeTab === 'failures' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Tests & Failures</h3>
              <div className="space-y-3">
                <div className="p-3 rounded bg-white/5 border-l-2 border-l-nexus-failure">
                  <p className="text-xs text-nexus-text/70">No failures recorded yet</p>
                </div>
              </div>
              <button className="mt-3 btn-primary text-xs">Log Failure</button>
            </div>
          </div>
        )}

        {activeTab === 'output' && (
          <div className="max-w-3xl">
            <div className="panel p-4">
              <h3 className="text-sm font-semibold mb-3">Generated Outputs</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <FileText size={14} className="text-nexus-text/50" />
                  <span className="text-xs text-nexus-text">Generate Report (LaTeX)</span>
                </button>
                <button className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <FileText size={14} className="text-nexus-text/50" />
                  <span className="text-xs text-nexus-text">Export Project Summary</span>
                </button>
                <button className="w-full text-left p-3 rounded bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2">
                  <FileText size={14} className="text-nexus-text/50" />
                  <span className="text-xs text-nexus-text">Generate Documentation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
