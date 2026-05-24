import React, { useEffect } from 'react'
import { useStore } from './stores/useStore'
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import CenterWorkspace from './components/layout/CenterWorkspace'
import RightInspector from './components/layout/RightInspector'
import BottomPanel from './components/layout/BottomPanel'
import CommandBar from './components/command/CommandBar'

function App() {
  const { refreshData } = useStore()

  useEffect(() => {
    refreshData()
    const interval = setInterval(refreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-nexus-bg text-nexus-text overflow-hidden">
      <TopBar />

      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <CenterWorkspace />
        <RightInspector />
      </div>

      <BottomPanel />
      <CommandBar />
    </div>
  )
}

export default App
