import React, { useEffect } from 'react'
import { useStore } from '../../stores/useStore'
import MemoryGraph from '../graph/MemoryGraph'
import DailyDashboard from '../modes/DailyDashboard'
import EngineeringCockpit from '../modes/EngineeringCockpit'
import AgentConsole from '../modes/AgentConsole'

export default function CenterWorkspace() {
  const { currentMode, graphData, setGraphData, dashboard, setDashboard } = useStore()

  useEffect(() => {
    // Load graph data when in graph mode
    if (currentMode === 'graph') {
      fetch('/api/graph')
        .then(r => r.json())
        .then(data => setGraphData(data))
        .catch(console.error)
    }

    // Load dashboard data
    if (!dashboard) {
      fetch('/api/dashboard')
        .then(r => r.json())
        .then(data => setDashboard(data))
        .catch(console.error)
    }
  }, [currentMode])

  const renderContent = () => {
    switch (currentMode) {
      case 'daily':
        return <DailyDashboard />
      case 'engineering':
        return <EngineeringCockpit />
      case 'graph':
        return <MemoryGraph data={graphData} />
      case 'agents':
        return <AgentConsole />
      case 'workflows':
        return (
          <div className="flex items-center justify-center h-full text-nexus-text/40">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Workflows</h2>
              <p className="text-sm">Workflow builder coming in Phase 6</p>
            </div>
          </div>
        )
      case 'files':
        return (
          <div className="flex items-center justify-center h-full text-nexus-text/40">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Files & Knowledge Base</h2>
              <p className="text-sm">File browser and semantic search coming in Phase 3</p>
            </div>
          </div>
        )
      case 'timeline':
        return (
          <div className="flex items-center justify-center h-full text-nexus-text/40">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Timeline</h2>
              <p className="text-sm">Full project history view coming in Phase 7</p>
            </div>
          </div>
        )
      default:
        return <DailyDashboard />
    }
  }

  return (
    <main className="flex-1 overflow-hidden relative">
      {renderContent()}
    </main>
  )
}
