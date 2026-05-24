import React, { useCallback, useEffect } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Handle,
  Position
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useStore } from '../../stores/useStore'

const NODE_COLORS = {
  project: '#118AB2',
  task: '#06D6A0',
  file: '#C5C6C7',
  memory: '#9D4EDD',
  decision: '#FFD166',
  failure: '#EF476F',
  agent: '#9D4EDD',
  workflow: '#F4A261',
  person: '#F4A261',
}

const CustomNode = ({ data, selected }) => {
  const { setSelectedNode } = useStore()
  const color = data.color || NODE_COLORS[data.type] || '#C5C6C7'

  return (
    <div 
      className={`px-3 py-2 rounded-lg border transition-all cursor-pointer min-w-[120px] ${
        selected ? 'border-nexus-accent shadow-lg shadow-nexus-accent/20' : 'border-white/10 hover:border-white/30'
      }`}
      style={{ backgroundColor: color + '20', borderColor: selected ? color : undefined }}
      onClick={() => setSelectedNode({ id: data.id, type: data.type, label: data.label, data })}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-nexus-border" />
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-nexus-text truncate">{data.label}</span>
      </div>
      {data.status && (
        <div className="mt-1 text-[10px] text-nexus-text/50 capitalize">{data.status.replace('_', ' ')}</div>
      )}
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-nexus-border" />
    </div>
  )
}

const nodeTypes = { custom: CustomNode }

export default function MemoryGraph({ data }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { selectedNode } = useStore()

  useEffect(() => {
    if (!data?.nodes) return

    const layoutNodes = data.nodes.map((node, i) => ({
      id: node.id,
      type: 'custom',
      position: node.x !== undefined ? { x: node.x, y: node.y } : {
        x: 100 + (i % 5) * 200,
        y: 100 + Math.floor(i / 5) * 150
      },
      data: { ...node.data, id: node.id, type: node.type, label: node.label },
      selected: selectedNode?.id === node.id,
    }))

    const layoutEdges = (data.edges || []).map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#45A29E', strokeWidth: 1, opacity: 0.6 },
      labelStyle: { fill: '#C5C6C7', fontSize: 10 },
    }))

    setNodes(layoutNodes)
    setEdges(layoutEdges)
  }, [data, selectedNode, setNodes, setEdges])

  const onNodeClick = useCallback((_, node) => {
    const { setSelectedNode } = useStore.getState()
    setSelectedNode({ id: node.id, type: node.data.type, label: node.data.label, data: node.data })
  }, [])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background color="#45A29E" gap={20} size={1} style={{ opacity: 0.1 }} />
        <Controls className="!bg-nexus-surface !border-white/10" />
        <MiniMap 
          className="!bg-nexus-surface !border-white/10"
          nodeColor={(n) => n.data?.color || NODE_COLORS[n.data?.type] || '#C5C6C7'}
          maskColor="rgba(11, 12, 16, 0.8)"
        />
      </ReactFlow>

      {/* Graph Filters */}
      <div className="absolute top-3 left-3 flex gap-1.5">
        {Object.entries(NODE_COLORS).slice(0, 6).map(([type, color]) => (
          <button
            key={type}
            className="px-2 py-1 rounded bg-nexus-surface/80 border border-white/10 text-[10px] capitalize hover:border-white/30 transition-colors"
            style={{ borderLeftColor: color, borderLeftWidth: 2 }}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  )
}
