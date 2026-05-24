import { create } from 'zustand'
import type { Mode, InspectorItem } from '@/types'

interface UIState {
  activeMode: Mode
  setMode: (mode: Mode) => void

  selectedNode: InspectorItem | null
  setSelectedNode: (node: InspectorItem | null) => void

  commandBarOpen: boolean
  setCommandBarOpen: (open: boolean) => void

  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void

  inspectorCollapsed: boolean
  setInspectorCollapsed: (v: boolean) => void

  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void

  activeUserId: string
  setActiveUserId: (id: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  activeMode: 'daily',
  setMode: (mode) => set({ activeMode: mode }),

  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),

  commandBarOpen: false,
  setCommandBarOpen: (open) => set({ commandBarOpen: open }),

  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  inspectorCollapsed: false,
  setInspectorCollapsed: (v) => set({ inspectorCollapsed: v }),

  activeProjectId: null,
  setActiveProjectId: (id) => set({ activeProjectId: id }),

  // Default demo user — replace with real auth later
  activeUserId: 'demo-user-id',
  setActiveUserId: (id) => set({ activeUserId: id }),
}))
