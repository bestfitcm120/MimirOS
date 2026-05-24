import React from 'react'
import { useStore } from '../../stores/useStore'
import { X, FileText, CheckCircle, AlertTriangle, Clock, Link2, MessageSquare, Zap, ChevronRight } from 'lucide-react'

export default function RightInspector() {
  const { selectedNode, inspectorOpen, toggleInspector, setSelectedNode } = useStore()

  if (!inspectorOpen) return null

  const node = selectedNode

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-nexus-success'
      case 'blocked': return 'text-nexus-urgent'
      case 'waiting': return 'text-nexus-pending'
      case 'active': return 'text-nexus-project'
      case 'in_progress': return 'text-nexus-accent'
      default: return 'text-nexus-text/60'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle size={14} className="text-nexus-success" />
      case 'blocked': return <AlertTriangle size={14} className="text-nexus-urgent" />
      case 'waiting': return <Clock size={14} className="text-nexus-pending" />
      default: return <FileText size={14} className="text-nexus-text/60" />
    }
  }

  return (
    <aside className="w-80 bg-nexus-bg border-l border-white/5 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-nexus-text/60">Inspector</span>
          {node && (
            <span className="text-xs px-1.5 py-0.5 bg-white/5 rounded capitalize">{node.type}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleInspector} className="p-1 hover:bg-white/5 rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {!node ? (
          <div className="text-center py-8 text-nexus-text/30">
            <FileText size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a node to inspect</p>
          </div>
        ) : (
          <>
            {/* Title & Status */}
            <div>
              <h3 className="text-sm font-semibold text-nexus-text mb-1">
                {node.data?.title || node.data?.filename || node.data?.label || node.label || 'Untitled'}
              </h3>
              {node.data?.status && (
                <div className={`flex items-center gap-1.5 text-xs ${getStatusColor(node.data.status)}`}>
                  {getStatusIcon(node.data.status)}
                  <span className="capitalize">{node.data.status.replace('_', ' ')}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {(node.data?.summary || node.data?.description) && (
              <div className="panel p-2.5">
                <p className="text-xs text-nexus-text/70 leading-relaxed">
                  {node.data.summary || node.data.description}
                </p>
              </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-2">
              {node.data?.priority && (
                <div className="panel p-2">
                  <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Priority</span>
                  <span className="text-xs font-medium">{node.data.priority}</span>
                </div>
              )}
              {node.data?.due_date && (
                <div className="panel p-2">
                  <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Due</span>
                  <span className="text-xs font-medium">{new Date(node.data.due_date).toLocaleDateString()}</span>
                </div>
              )}
              {node.data?.phase && (
                <div className="panel p-2">
                  <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Phase</span>
                  <span className="text-xs font-medium capitalize">{node.data.phase}</span>
                </div>
              )}
              {node.data?.file_type && (
                <div className="panel p-2">
                  <span className="text-[10px] uppercase tracking-wider text-nexus-text/40 block mb-1">Type</span>
                  <span className="text-xs font-medium">{node.data.file_type}</span>
                </div>
              )}
            </div>

            {/* Linked Items */}
            <div className="panel p-2.5">
              <div className="flex items-center gap-2 mb-2 text-nexus-text/60">
                <Link2 size={12} />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Linked</span>
              </div>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 text-left text-xs text-nexus-text/60 hover:text-nexus-text py-1 group">
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>View related tasks</span>
                </button>
                <button className="w-full flex items-center gap-2 text-left text-xs text-nexus-text/60 hover:text-nexus-text py-1 group">
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>View connected files</span>
                </button>
                <button className="w-full flex items-center gap-2 text-left text-xs text-nexus-text/60 hover:text-nexus-text py-1 group">
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span>View timeline history</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button className="w-full btn-primary flex items-center justify-center gap-2">
                <Zap size={14} />
                <span className="text-xs">Suggest Next Action</span>
              </button>
              <button className="w-full btn-ghost flex items-center justify-center gap-2">
                <MessageSquare size={14} />
                <span className="text-xs">Add Note</span>
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  )
}
