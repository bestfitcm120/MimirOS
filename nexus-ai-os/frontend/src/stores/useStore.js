import { create } from 'zustand'

export const useStore = create((set, get) => ({
  // UI State
  currentMode: 'daily',
  selectedNode: null,
  commandBarOpen: false,
  inspectorOpen: true,

  // Data
  projects: [],
  tasks: [],
  files: [],
  memories: [],
  events: [],
  graphData: { nodes: [], edges: [] },
  dashboard: null,

  // Loading
  loading: false,
  error: null,

  // Actions
  setMode: (mode) => set({ currentMode: mode, selectedNode: null }),
  setSelectedNode: (node) => set({ selectedNode: node, inspectorOpen: true }),
  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  toggleCommandBar: () => set((state) => ({ commandBarOpen: !state.commandBarOpen })),

  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setFiles: (files) => set({ files }),
  setMemories: (memories) => set({ memories }),
  setEvents: (events) => set({ events }),
  setGraphData: (graphData) => set({ graphData }),
  setDashboard: (dashboard) => set({ dashboard }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Refresh all data
  refreshData: async () => {
    try {
      set({ loading: true })
      const [projectsRes, tasksRes, eventsRes, dashboardRes] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/dashboard').then(r => r.json()),
      ])

      set({
        projects: projectsRes,
        tasks: tasksRes,
        dashboard: dashboardRes,
        loading: false
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  }
}))
