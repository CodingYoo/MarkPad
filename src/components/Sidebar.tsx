import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { FolderOpen, Tag, CheckSquare, FileText, Lightbulb, Users, Plus, Settings, Database, Image, Download, Upload, Moon, Sun } from 'lucide-react'
import { ProjectModal } from './ProjectModal'
import { TypeModal } from './TypeModal'
import { TagModal } from './TagModal'
import { ImageGallery } from './ImageGallery'
import { getTagColor } from '../utils'

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

export const Sidebar = () => {
  const { projects, types, tags, filter, setFilter, resetFilter, exportData, loadData, settings, toggleTheme } = useStore()
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showImageGallery, setShowImageGallery] = useState(false)
  const settingsMenuRef = useRef<HTMLDivElement>(null)

  const iconMap: Record<string, typeof CheckSquare> = {
    CheckSquare,
    FileText,
    Lightbulb,
    Users,
  }

  const iconColorMap: Record<string, string> = {
    CheckSquare: '#10b981',
    FileText: '#3b82f6',
    Lightbulb: '#f59e0b',
    Users: '#8b5cf6',
  }

  // 点击外部关闭应用设置菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setShowSettings(false)
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSettings])

  const handleExport = async () => {
    try {
      const data = exportData()
      const dataStr = JSON.stringify(data, null, 2)
      
      if (!isTauri || !save || !invoke) {
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
    setShowSettings(false)
  }

  const handleImport = async () => {
    try {
      if (!isTauri || !open || !invoke) {
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
    setShowSettings(false)
  }

  const handleBackup = async () => {
    try {
      const data = exportData()
      const dataStr = JSON.stringify(data, null, 2)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      
      if (!isTauri || !save || !invoke) {
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
    setShowSettings(false)
  }

  return (
    <>
      <div className="w-48 lg:w-56 xl:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-[0.5] min-w-[180px]">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">MarkPad</h2>
        </div>

      {/* All Notes */}
      <div className="p-2">
        <button
          onClick={() => resetFilter()}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
            !filter.projectId && !filter.typeId && filter.tagIds.length === 0
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FileText size={18} className={
            !filter.projectId && !filter.typeId && filter.tagIds.length === 0
              ? ''
              : 'text-blue-500 dark:text-blue-400'
          } />
          <span>所有便签</span>
        </button>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">项目</h3>
            <button 
              onClick={() => setProjectModalOpen(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Plus size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setFilter({ projectId: project.id, typeId: null, tagIds: [] })}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  filter.projectId === project.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <FolderOpen size={18} style={{ color: project.color }} />
                <span className="flex-1 text-left truncate">{project.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Types */}
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">类型</h3>
            <button 
              onClick={() => setTypeModalOpen(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Plus size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="space-y-1">
            {types.map((type) => {
              const Icon = iconMap[type.icon] || FileText
              const iconColor = iconColorMap[type.icon] || '#3b82f6'
              return (
                <button
                  key={type.id}
                  onClick={() => setFilter({ typeId: type.id, projectId: null, tagIds: [] })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    filter.typeId === type.id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} style={{ color: iconColor }} />
                  <span className="flex-1 text-left truncate">{type.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tags */}
        <div className="p-2">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">标签</h3>
            <button 
              onClick={() => setTagModalOpen(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Plus size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="space-y-2">
            {(() => {
              // 按组分类标签
              const groupedTags: Record<string, typeof tags> = {}
              const ungroupedTags: typeof tags = []
              
              tags.forEach(tag => {
                if (tag.group) {
                  if (!groupedTags[tag.group]) {
                    groupedTags[tag.group] = []
                  }
                  groupedTags[tag.group].push(tag)
                } else {
                  ungroupedTags.push(tag)
                }
              })

              return (
                <>
                  {/* 分组标签 */}
                  {Object.entries(groupedTags).map(([groupName, groupTags]) => (
                    <div key={groupName} className="space-y-1">
                      <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                        {groupName}
                      </div>
                      {groupTags.map((tag) => {
                        const isSelected = filter.tagIds.includes(tag.id)
                        const tagColor = getTagColor(tag.name)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setFilter({
                                tagIds: isSelected ? [] : [tag.id],
                              })
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm ${
                              isSelected
                                ? `${tagColor.bg} ${tagColor.text} border ${tagColor.border}`
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Tag size={16} className={tagColor.text} />
                            <span className="flex-1 text-left truncate">#{tag.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                  
                  {/* 未分组标签 */}
                  {ungroupedTags.length > 0 && (
                    <div className="space-y-1">
                      {Object.keys(groupedTags).length > 0 && (
                        <div className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500">
                          其他
                        </div>
                      )}
                      {ungroupedTags.map((tag) => {
                        const isSelected = filter.tagIds.includes(tag.id)
                        const tagColor = getTagColor(tag.name)
                        return (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setFilter({
                                tagIds: isSelected ? [] : [tag.id],
                              })
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm ${
                              isSelected
                                ? `${tagColor.bg} ${tagColor.text} border ${tagColor.border}`
                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Tag size={16} className={tagColor.text} />
                            <span className="flex-1 text-left truncate">#{tag.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="relative" ref={settingsMenuRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Settings size={18} className="text-gray-500 dark:text-gray-400" />
            <span>应用设置</span>
          </button>
          {showSettings && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setShowSettings(false)}
              />
              {/* Settings Menu */}
              <div className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  toggleTheme()
                  setShowSettings(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {settings.theme === 'light' ? 
                  <Moon size={16} className="text-indigo-500" /> : 
                  <Sun size={16} className="text-amber-500" />
                }
                <span>{settings.theme === 'light' ? '深色模式' : '浅色模式'}</span>
              </button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
              <button
                onClick={() => {
                  setShowImageGallery(true)
                  setShowSettings(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Image size={16} className="text-pink-500" />
                <span>图片管理</span>
              </button>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
              <button
                onClick={handleExport}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Download size={16} className="text-green-500" />
                <span>导出数据</span>
              </button>
              <button
                onClick={handleImport}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Upload size={16} className="text-blue-500" />
                <span>导入数据</span>
              </button>
              <button
                onClick={handleBackup}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Database size={16} className="text-purple-500" />
                <span>备份数据</span>
              </button>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Modals */}
      <ProjectModal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      <TypeModal isOpen={typeModalOpen} onClose={() => setTypeModalOpen(false)} />
      <TagModal isOpen={tagModalOpen} onClose={() => setTagModalOpen(false)} />
      <ImageGallery isOpen={showImageGallery} onClose={() => setShowImageGallery(false)} />
    </>
  )
}
