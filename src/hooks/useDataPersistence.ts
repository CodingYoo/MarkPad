import { useEffect, useRef } from 'react'
import { useStore } from '../store'

// Check if running in Tauri environment
const isTauri = '__TAURI__' in window

export const useDataPersistence = () => {
  const store = useStore()
  const isInitialMount = useRef(true)
  const saveTimeoutRef = useRef<NodeJS.Timeout>()

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      if (!isTauri) {
        // Load from localStorage in browser mode
        try {
          const dataStr = localStorage.getItem('markpad-data')
          if (dataStr) {
            const data = JSON.parse(dataStr)
            store.loadData(data)
            console.log('Data loaded from localStorage')
          }
        } catch (error) {
          console.error('Failed to load data from localStorage:', error)
        }
        return
      }

      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const dataStr = await invoke<string>('load_data')
        if (dataStr) {
          const data = JSON.parse(dataStr)
          store.loadData(data)
          console.log('Data loaded successfully')
        }
      } catch (error) {
        console.error('Failed to load data:', error)
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

      if (!isTauri) {
        // Save to localStorage in browser mode
        try {
          localStorage.setItem('markpad-data', dataStr)
          console.log('Data saved to localStorage')
        } catch (error) {
          console.error('Failed to save data to localStorage:', error)
        }
        return
      }

      try {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('save_data', { data: dataStr })
        console.log('Data saved successfully')
      } catch (error) {
        console.error('Failed to save data:', error)
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
    store.settings,
  ])
}
