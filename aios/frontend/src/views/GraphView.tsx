import { useCallback, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { Filter, Search, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { mockGraphNodes, mockGraphEdges } from '@/data/mockData'
import type { NodeType } from '@/types'

// Color map per node type
const NODE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  project: { bg: '#1e2d3d', border: '#3b82f6', text: '#93c5fd', dot: '#3b82f6' },
  task: { bg: '#1a2e1a', border: '#22c55e', text: '#86efac', dot: '#22c55e' },
  file: { bg: '#1e1e2a', border: '#64748b', text: '#94a3b8', dot: '#64748b' },
  decision: { bg: '#2a1a3a', border: '#a855f7', text: '#d8b4fe', dot: '#a855f7' },
  failure: { bg: '#2e1a1a', border: '#ff4444', text: '#fca5a5', dot: '#ff4444' },
  person: { bg: '#2e1e0e', border: '#f97316', text: '#fdba74', dot: '#f97316' },
  memory: { bg: '#1a1e2e', border: '#6366f1', text: '#a5b4fc', dot: '#6366f1' },
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  running: '#22c55e',
  blocked: '#ff4444',
  failed: '#ff4444',
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  done: '#64748b',
  completed: '#64748b',
  resolved: '#64748b',
  paused: '#64748b',
}

function CustomNode({ data }: { data: { label: string; nodeType: NodeType; status?: string; color?: string; phase?: string } }) {
  const colors = NODE_COLORS[data.nodeType] || NODE_COLORS.memory
  const statusColor = data.status ? STATUS_COLORS[data.status] : undefined

  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-medium shadow-lg cursor-pointer transition-all hover:scale-105"
      style={{
        background: colors.bg,
        border: `1.5px solid ${statusColor || colors.border}`,
        color: colors.text,
        minWidth: 100,
        maxWidth: 160,
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor || colors.dot }} />
        <span className="truncate font-medium">{data.label}</span>
      </div>
      {data.phase && (
        <div className="text-2xs mt-0.5 opacity-60 truncate">{data.phase}</div>
      )}
    </div>
  )
}

const nodeTypes: NodeTypes = { custom: CustomNode }

// Build React Flow nodes from mock data with layout positions
const buildFlowNodes = (): Node[] => {
  const positions: Record<string, { x: number; y: number }> = {
    p1: { x: 300, y: 100 },
    p2: { x: 700, y: 100 },
    p3: { x: 1100, y: 100 },
    t1: { x: 700, y: 280 },
    t2: { x: 150, y: 280 },
    t3: { x: 1100, y: 280 },
    t5: { x: 300, y: 400 },
    d1: { x: 50, y: 450 },
    d2: { x: 300, y: 560 },
    f1: { x: 550, y: 450 },
    f2: { x: 150, y: 580 },
    fi1: { x: 700, y: 420 },
    fi2: { x: 500, y: 300 },
    fi6: { x: 1200, y: 280 },
  }

  return mockGraphNodes.map(n => ({
    id: n.id,
    type: 'custom',
    position: positions[n.id] || { x: Math.random() * 800, y: Math.random() * 600 },
    data: {
      label: n.label,
      nodeType: n.type,
      status: n.data.status as string,
      phase: n.data.phase as string,
    },
  }))
}

const buildFlowEdges = (): Edge[] =>
  mockGraphEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    style: { stroke: '#2a2a3a', strokeWidth: 1.5 },
    labelStyle: { fill: '#64748b', fontSize: 9, fontFamily: 'DM Sans' },
    labelBgStyle: { fill: '#111118', fillOpacity: 0.9 },
  }))

const FILTER_TYPES: { id: NodeType | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All', color: '#6366f1' },
  { id: 'project', label: 'Projects', color: '#3b82f6' },
  { id: 'task', label: 'Tasks', color: '#22c55e' },
  { id: 'decision', label: 'Decisions', color: '#a855f7' },
  { id: 'failure', label: 'Failures', color: '#ff4444' },
  { id: 'file', label: 'Files', color: '#64748b' },
]

export default function GraphView() {
  const { setSelectedNode } = useUIStore()
  const [nodes, setNodes, onNodesChange] = useNodesState(buildFlowNodes())
  const [edges, , onEdgesChange] = useEdgesState(buildFlowEdges())
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredNodes = nodes.map(n => ({
    ...n,
    hidden: (
      (activeFilter !== 'all' && n.data.nodeType !== activeFilter) ||
      (searchQuery && !n.data.label.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
  }))

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode({
      id: node.id,
      nodeType: node.data.nodeType as NodeType,
      title: node.data.label,
      status: node.data.status,
    })
  }, [setSelectedNode])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface">
        <h2 className="font-display text-sm font-semibold text-text-primary">Memory Graph</h2>
        <div className="flex items-center gap-1 ml-2">
          {FILTER_TYPES.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                activeFilter === f.id
                  ? 'text-white'
                  : 'text-text-dim hover:text-text-secondary'
              }`}
              style={activeFilter === f.id ? { backgroundColor: f.color + '30', color: f.color, border: `1px solid ${f.color}40` } : {}}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-elevated border border-border rounded text-xs text-text-muted">
            <Search size={12} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="bg-transparent outline-none text-text-secondary placeholder:text-text-dim w-28"
            />
          </div>
          <button
            onClick={() => { setActiveFilter('all'); setSearchQuery('') }}
            className="btn-ghost p-1.5 rounded"
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Graph canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          attributionPosition="bottom-right"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1}
            color="#1a1a24"
          />
          <Controls
            style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8 }}
          />
          <MiniMap
            style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 8 }}
            nodeColor={(n) => {
              const colors = NODE_COLORS[n.data?.nodeType] || NODE_COLORS.memory
              return colors.border
            }}
            maskColor="rgba(10,10,15,0.7)"
          />
        </ReactFlow>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute bottom-4 left-4 panel p-2.5 flex flex-wrap gap-x-3 gap-y-1.5"
        >
          {Object.entries(NODE_COLORS).slice(0, 6).map(([type, c]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.dot }} />
              <span className="text-2xs text-text-dim capitalize">{type}</span>
            </div>
          ))}
        </motion.div>

        {/* Node count */}
        <div className="absolute top-4 right-4 panel px-2.5 py-1.5">
          <span className="text-2xs text-text-dim">
            {filteredNodes.filter(n => !n.hidden).length} nodes · {edges.length} edges
          </span>
        </div>
      </div>
    </div>
  )
}
