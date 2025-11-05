import { useEffect, useRef } from 'react'
import { useStore } from '../store'

export const useDataPersistence = () => {
  const store = useStore()
  const isInitialMount = useRef(true)
  const saveTimeoutRef = useRef<number>()

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to use Tauri first
        const { invoke } = await import('@tauri-apps/api/core')
        const dataStr = await invoke<string>('load_data')
        if (dataStr) {
          const data = JSON.parse(dataStr)
          store.loadData(data)
          console.log('Data loaded successfully from Tauri')
        }
      } catch (error) {
        // Fallback to localStorage in browser mode
        console.log('Not in Tauri environment, using localStorage')
        try {
          const dataStr = localStorage.getItem('markpad-data')
          if (dataStr) {
            const data = JSON.parse(dataStr)
            store.loadData(data)
            console.log('Data loaded from localStorage')
          }
        } catch (localError) {
          console.error('Failed to load data from localStorage:', localError)
        }
      }
    }

    loadData()
  }, [])

  // Save data when store changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const data = store.exportData()
      const dataStr = JSON.stringify(data, null, 2)

      try {
        // Try to use Tauri first
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('save_data', { data: dataStr })
        console.log('Data saved successfully to Tauri')
      } catch (error) {
        // Fallback to localStorage in browser mode
        console.log('Not in Tauri environment, using localStorage')
        try {
          localStorage.setItem('markpad-data', dataStr)
          console.log('Data saved to localStorage')
        } catch (localError) {
          console.error('Failed to save data to localStorage:', localError)
        }
      }
    }, 1000)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    store.notes,
    store.projects,
    store.types,
    store.tags,
    store.folders,
    store.settings,
  ])
}
