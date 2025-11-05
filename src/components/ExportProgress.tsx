import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

interface ExportProgressProps {
  isOpen: boolean
  onClose: () => void
}

interface ProgressState {
  stage: string
  message: string
  progress: number
}

export const ExportProgress = ({ isOpen, onClose }: ExportProgressProps) => {
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'init',
    message: '准备导出...',
    progress: 0
  })

  useEffect(() => {
    if (!isOpen) {
      // 重置进度
      setProgress({
        stage: 'init',
        message: '准备导出...',
        progress: 0
      })
      return
    }

    const handleProgress = async (event: any) => {
      const data = event.payload as ProgressState
      setProgress(data)

      // 如果完成，3秒后自动关闭
      if (data.stage === 'complete') {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }

    // 动态导入Tauri事件监听
    const setupListener = async () => {
      try {
        const { listen } = await import('@tauri-apps/api/event')
        const unlisten = await listen('pdf-export-progress', handleProgress)
        return unlisten
      } catch (error) {
        console.log('Tauri event listener not available:', error)
        return null
      }
    }

    let unlisten: any = null
    setupListener().then((fn) => {
      unlisten = fn
    })

    return () => {
      if (unlisten && typeof unlisten === 'function') {
        unlisten()
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-[90vw]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            导出PDF
          </h3>
          {progress.stage === 'complete' && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progress.message}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {progress.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progress.stage === 'complete'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {progress.stage === 'complete' && (
          <div className="text-sm text-green-600 dark:text-green-400 text-center">
            ✓ PDF导出成功！
          </div>
        )}

        {progress.stage !== 'complete' && (
          <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
            请稍候，正在处理...
          </div>
        )}
      </div>
    </div>
  )
}
