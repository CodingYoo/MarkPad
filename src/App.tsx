import { useEffect } from 'react'
import { Sidebar, NoteList, Editor } from './components'
import { useStore } from './store'
import { useDataPersistence } from './hooks/useDataPersistence'

function App() {
  const { settings } = useStore()
  
  // Initialize data persistence
  useDataPersistence()

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar />
      <NoteList />
      <Editor />
    </div>
  )
}

export default App
