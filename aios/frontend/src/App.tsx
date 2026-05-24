import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import Shell from '@/components/shell/Shell'
import CommandBar from '@/components/shell/CommandBar'

export default function App() {
  const setCommandBarOpen = useUIStore(s => s.setCommandBarOpen)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandBarOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandBarOpen])

  return (
    <div className="h-full w-full overflow-hidden bg-base bg-grid-pattern">
      <Shell />
      <CommandBar />
    </div>
  )
}
