import React from 'react'
import { useStore } from '../../stores/useStore'
import { Cpu, Activity, Shield, Clock, CheckCircle, AlertTriangle, Terminal } from 'lucide-react'

const AGENTS = [
  {
    id: 'memory-agent',
    name: 'Memory Agent',
    purpose: 'Organizes memory, creates links, summarizes projects',
    status: 'idle',
    tools: ['memory_db', 'graph_update', 'file_summary'],
    lastRun: '2 hours ago',
    runs: 142
  },
  {
    id: 'daily-agent',
    name: 'Daily Planning Agent',
    purpose: 'Ranks priorities, detects overdue, suggests focus',
    status: 'running',
    tools: ['task_db', 'calendar', 'notification'],
    lastRun: '5 minutes ago',
    runs: 89
  },
  {
    id: 'engineering-agent',
    name: 'Engineering Agent',
    purpose: 'Organizes projects, summarizes files, tracks decisions',
    status: 'idle',
    tools: ['project_files', 'code_reader', 'latex_gen'],
    lastRun: '1 day ago',
    runs: 34
  }
]

export default function AgentConsole() {
  const { setSelectedNode } = useStore()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-nexus-text flex items-center gap-2">
              <Cpu size={24} className="text-nexus-agent" />
              Agent Console
            </h1>
            <p className="text-sm text-nexus-text/50 mt-1">Monitor and control AI agents</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-dot status-active animate-pulse" />
            <span className="text-xs text-nexus-success">1 Agent Running</span>
          </div>
        </div>

        <div className="grid gap-4">
          {AGENTS.map(agent => (
            <div 
              key={agent.id}
              className="panel p-4 hover:border-nexus-border/30 transition-colors cursor-pointer"
              onClick={() => setSelectedNode({ id: agent.id, type: 'agent', data: agent })}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    agent.status === 'running' ? 'bg-nexus-agent/20' : 'bg-white/5'
                  }`}>
                    <Cpu size={20} className={agent.status === 'running' ? 'text-nexus-agent' : 'text-nexus-text/50'} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-nexus-text">{agent.name}</h3>
                    <p className="text-xs text-nexus-text/50">{agent.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded ${
                    agent.status === 'running' 
                      ? 'bg-nexus-success/20 text-nexus-success' 
                      : 'bg-white/5 text-nexus-text/50'
                  }`}>
                    {agent.status === 'running' ? <Activity size={12} className="animate-pulse" /> : <Clock size={12} />}
                    <span className="capitalize">{agent.status}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-nexus-text/40">
                <div className="flex items-center gap-1.5">
                  <Terminal size={12} />
                  <span>{agent.tools.length} Tools</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle size={12} />
                  <span>{agent.runs} Runs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  <span>Last: {agent.lastRun}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {agent.tools.map(tool => (
                  <span key={tool} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-nexus-text/50 capitalize">
                    {tool.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Agent Activity Log */}
        <div className="panel p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Terminal size={14} className="text-nexus-text/50" />
            Recent Activity
          </h3>
          <div className="space-y-2">
            <div className="flex items-start gap-3 text-xs">
              <span className="text-nexus-text/30 font-mono">10:42</span>
              <span className="text-nexus-success">●</span>
              <div>
                <span className="text-nexus-text/70">Daily Planning Agent</span>
                <span className="text-nexus-text/40"> ranked 5 tasks for today</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="text-nexus-text/30 font-mono">08:15</span>
              <span className="text-nexus-agent">●</span>
              <div>
                <span className="text-nexus-text/70">Memory Agent</span>
                <span className="text-nexus-text/40"> created 3 new relationships</span>
              </div>
            </div>
            <div className="flex items-start gap-3 text-xs">
              <span className="text-nexus-text/30 font-mono">Yesterday</span>
              <span className="text-nexus-project">●</span>
              <div>
                <span className="text-nexus-text/70">Engineering Agent</span>
                <span className="text-nexus-text/40"> summarized Arduino project files</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
