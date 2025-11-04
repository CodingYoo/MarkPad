import { useEffect, useState } from 'react'
import { Sidebar, NoteList, Editor, ImageGallery } from './components'
import { useStore } from './store'
import { useDataPersistence } from './hooks/useDataPersistence'
import { Moon, Sun, Download, Upload, Database, Image } from 'lucide-react'

// Check if running in Tauri environment
const isTauri = '__TAURI__' in window

// Dynamic import for Tauri APIs
let invoke: any = null
let save: any = null
let open: any = null

if (isTauri) {
  import('@tauri-apps/api/core').then(module => {
    invoke = module.invoke
  })
  import('@tauri-apps/plugin-dialog').then(module => {
    save = module.save
    open = module.open
  }).catch(() => {
    console.warn('Dialog plugin not available')
  })
}

function App() {
  const { settings, toggleTheme, exportData, loadData } = useStore()
  const [showMenu, setShowMenu] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  
  // Initialize data persistence
  useDataPersistence()

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  const handleExport = async () => {
    try {
      const data = exportData()
      const dataStr = JSON.stringify(data, null, 2)
      
      if (!isTauri || !save || !invoke) {
        // Fallback: download as file in browser
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'markpad-export.json'
        a.click()
        URL.revokeObjectURL(url)
        alert('数据导出成功！')
      } else {
        const filePath = await save({
          defaultPath: 'markpad-export.json',
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })

        if (filePath) {
          await invoke('export_data', { data: dataStr, path: filePath })
          alert('数据导出成功！')
        }
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('导出失败：' + error)
    }
    setShowMenu(false)
  }

  const handleImport = async () => {
    try {
      if (!isTauri || !open || !invoke) {
        // Fallback: use file input in browser
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'
        input.onchange = async (e: any) => {
          const file = e.target.files[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              try {
                const dataStr = e.target?.result as string
                const data = JSON.parse(dataStr)
                loadData(data)
                alert('数据导入成功！')
              } catch (error) {
                alert('导入失败：JSON 格式错误')
              }
            }
            reader.readAsText(file)
          }
        }
        input.click()
      } else {
        const filePath = await open({
          multiple: false,
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })

        if (filePath) {
          const dataStr = await invoke('import_data', { path: filePath })
          const data = JSON.parse(dataStr)
          loadData(data)
          alert('数据导入成功！')
        }
      }
    } catch (error) {
      console.error('Failed to import data:', error)
      alert('导入失败：' + error)
    }
    setShowMenu(false)
  }

  const handleBackup = async () => {
    try {
      const data = exportData()
      const dataStr = JSON.stringify(data, null, 2)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      
      if (!isTauri || !save || !invoke) {
        // Fallback: download as file in browser
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `markpad-backup-${timestamp}.json`
        a.click()
        URL.revokeObjectURL(url)
        alert('备份成功！')
      } else {
        const filePath = await save({
          defaultPath: `markpad-backup-${timestamp}.json`,
          filters: [{ name: 'JSON', extensions: ['json'] }]
        })

        if (filePath) {
          await invoke('export_data', { data: dataStr, path: filePath })
          alert('备份成功！')
        }
      }
    } catch (error) {
      console.error('Failed to backup data:', error)
      alert('备份失败：' + error)
    }
    setShowMenu(false)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MarkPad</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImageGallery(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="图片管理"
          >
            <Image size={18} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="数据管理"
            >
              <Database size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download size={16} />
                  <span>导出数据</span>
                </button>
                <button
                  onClick={handleImport}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Upload size={16} />
                  <span>导入数据</span>
                </button>
                <button
                  onClick={handleBackup}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Database size={16} />
                  <span>备份数据</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="切换主题"
          >
            {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <NoteList />
        <Editor />
      </div>

      {/* Image Gallery Modal */}
      <ImageGallery isOpen={showImageGallery} onClose={() => setShowImageGallery(false)} />
    </div>
  )
}

export default App
