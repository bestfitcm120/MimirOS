import { useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

export const useApi = () => {
  const request = useCallback(async (endpoint, options = {}) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`API Error: ${res.status}`)
    return res.json()
  }, [])

  return {
    getProjects: () => request('/api/projects'),
    getTasks: (params = '') => request(`/api/tasks?${params}`),
    getTodayTasks: () => request('/api/tasks/today'),
    getOverdueTasks: () => request('/api/tasks/overdue'),
    getFiles: () => request('/api/files'),
    getMemories: () => request('/api/memories'),
    getGraph: (params = '') => request(`/api/graph?${params}`),
    getDashboard: () => request('/api/dashboard'),
    search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
    sendCommand: (command, mode) => request('/api/command', {
      method: 'POST',
      body: JSON.stringify({ command, mode })
    }),
    uploadFile: (formData) => request('/api/files/upload', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    }),
    createProject: (data) => request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    createTask: (data) => request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    completeTask: (id) => request(`/api/tasks/${id}/complete`, { method: 'PATCH' }),
  }
}
