import { useUIStore } from '@/stores/uiStore'
import TopBar from './TopBar'
import LeftPanel from './LeftPanel'
import RightInspector from './RightInspector'
import BottomBar from './BottomBar'
import DailyView from '@/views/DailyView'
import GraphView from '@/views/GraphView'
import EngineeringView from '@/views/EngineeringView'
import AgentConsoleView from '@/views/AgentConsoleView'
import WorkflowView from '@/views/WorkflowView'
import FilesView from '@/views/FilesView'
import TimelineView from '@/views/TimelineView'
import { AnimatePresence, motion } from 'framer-motion'

const VIEWS = {
  daily: DailyView,
  graph: GraphView,
  engineering: EngineeringView,
  agents: AgentConsoleView,
  workflows: WorkflowView,
  files: FilesView,
  timeline: TimelineView,
}

export default function Shell() {
  const { activeMode, sidebarCollapsed, inspectorCollapsed } = useUIStore()
  const ActiveView = VIEWS[activeMode]

  return (
    <div
      className="h-full w-full flex flex-col"
      style={{ fontFamily: '"DM Sans", system-ui, sans-serif' }}
    >
      {/* Top bar */}
      <TopBar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <motion.div
          animate={{ width: sidebarCollapsed ? 0 : 220 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 overflow-hidden border-r border-border"
        >
          <div style={{ width: 220 }}>
            <LeftPanel />
          </div>
        </motion.div>

        {/* Center workspace */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMode}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className="h-full w-full"
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right inspector */}
        <motion.div
          animate={{ width: inspectorCollapsed ? 0 : 300 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="flex-shrink-0 overflow-hidden border-l border-border"
        >
          <div style={{ width: 300 }}>
            <RightInspector />
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <BottomBar />
    </div>
  )
}
