import { useMemo, useEffect, useState } from 'react'
import { useStore } from '../store'
import { formatDetailedDate, getTagColor } from '../utils'
import { Search, Pin, ChevronLeft, ChevronRight, Clock, Folder, FolderPlus, ChevronDown, ChevronRight as ChevronRightIcon, Plus } from 'lucide-react'
import { FolderModal } from './FolderModal'

export const NoteList = () => {
  const {
    notes,
    tags,
    projects,
    types,
    folders,
    filter,
    currentNoteId,
    setCurrentNote,
    createNote,
    updateFolder,
    deleteFolder,
    setFilter,
  } = useStore()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null)
  const [folderModalOpen, setFolderModalOpen] = useState(false)

  const filteredNotes = useMemo(() => {
    let result = [...notes]

    // Filter by project
    if (filter.projectId) {
      result = result.filter((note) => note.projectId === filter.projectId)
    }

    // Filter by type
    if (filter.typeId) {
      result = result.filter((note) => note.typeId === filter.typeId)
    }

    // Filter by tags
    if (filter.tagIds.length > 0) {
      result = result.filter((note) =>
        filter.tagIds.every((tagId) => note.tagIds.includes(tagId))
      )
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      )
    }

    // Sort: pinned first, then by updatedAt
    result.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    return result
  }, [notes, filter])

  useEffect(() => {
    if (filteredNotes.length > 0) {
      const currentNoteInList = filteredNotes.find((note) => note.id === currentNoteId)
      if (!currentNoteInList) {
        setCurrentNote(filteredNotes[0].id)
      }
    } else {
      setCurrentNote(null)
    }
  }, [filteredNotes, currentNoteId, setCurrentNote])

  // 获取当前列表的标题
  const getListTitle = () => {
    // 如果有项目过滤
    if (filter.projectId) {
      const project = projects.find(p => p.id === filter.projectId)
      return project ? `${project.name}项目` : '项目笔记'
    }
    
    // 如果有类型过滤
    if (filter.typeId) {
      const type = types.find(t => t.id === filter.typeId)
      if (type) {
        // 根据类型名称返回不同的称呼
        const typeNameMap: Record<string, string> = {
          '待办': '任务清单',
          '想法': '灵感记录',
          '学习': '学习笔记',
          '工作': '工作记录',
        }
        return typeNameMap[type.name] || `${type.name}笔记`
      }
      return '分类笔记'
    }
    
    // 如果有标签过滤
    if (filter.tagIds.length > 0) {
      if (filter.tagIds.length === 1) {
        const tag = tags.find(t => t.id === filter.tagIds[0])
        return tag ? `#${tag.name}` : '标签合集'
      }
      return '标签合集'
    }
    
    // 默认显示笔记本
    return '笔记本'
  }

  const handleCreateNote = (folderId: string | null = null) => {
    createNote({
      title: '无标题',
      content: '',
      projectId: filter.projectId,
      typeId: filter.typeId,
      tagIds: filter.tagIds,
      folderId: folderId,
    })
  }

  const handleCreateFolder = () => {
    setFolderModalOpen(true)
  }

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleRenameFolder = (folderId: string, currentName: string) => {
    setEditingFolderId(folderId)
    setEditingFolderName(currentName)
    setContextMenu(null)
  }

  const saveRenameFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      updateFolder(editingFolderId, editingFolderName.trim())
    }
    setEditingFolderId(null)
    setEditingFolderName('')
  }

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('确定删除此文件夹吗？文件夹内的文章将移至根目录。')) {
      deleteFolder(folderId)
      setContextMenu(null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, folderId })
  }

  // Close context menu on click outside
  useEffect(() => {
    if (contextMenu) {
      const handleClick = () => setContextMenu(null)
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu])

  // Filter folders by current project and type
  const filteredFolders = useMemo(() => {
    let result = [...folders]
    
    // 在"所有便签"模式下（没有选择项目和类型），显示所有文件夹
    if (!filter.projectId && !filter.typeId && filter.tagIds.length === 0) {
      // 所有便签模式：显示所有文件夹，按项目分组排序
      result.sort((a, b) => {
        // 先按项目排序
        const projectA = projects.find(p => p.id === a.projectId)?.name || ''
        const projectB = projects.find(p => p.id === b.projectId)?.name || ''
        if (projectA !== projectB) {
          return projectA.localeCompare(projectB, 'zh-CN')
        }
        // 同一项目内按创建时间排序
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
    } else {
      // 否则根据当前过滤条件显示文件夹
      result = result.filter(folder => {
        // 必须匹配项目（如果有选择项目）
        if (filter.projectId && folder.projectId !== filter.projectId) {
          return false
        }
        // 必须匹配类型（如果有选择类型）
        if (filter.typeId && folder.typeId !== filter.typeId) {
          return false
        }
        return true
      })
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
    
    return result
  }, [folders, filter.projectId, filter.typeId, filter.tagIds, projects])

  // Group notes by folder
  const { notesWithoutFolder, notesByFolder } = useMemo(() => {
    const withoutFolder: typeof filteredNotes = []
    const byFolder: Record<string, typeof filteredNotes> = {}
    
    filteredNotes.forEach(note => {
      if (note.folderId) {
        if (!byFolder[note.folderId]) {
          byFolder[note.folderId] = []
        }
        byFolder[note.folderId].push(note)
      } else {
        // 在"所有便签"模式下，不显示没有文件夹的笔记
        if (filter.projectId || filter.typeId || filter.tagIds.length > 0) {
          withoutFolder.push(note)
        }
      }
    })
    
    return { notesWithoutFolder: withoutFolder, notesByFolder: byFolder }
  }, [filteredNotes, filter.projectId, filter.typeId, filter.tagIds])

  return (
    <div className={`bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'}`}>
      {isCollapsed ? (
        /* Collapsed State */
        <div className="flex flex-col items-center h-full">
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border-b border-gray-200 dark:border-gray-700"
            title="展开笔记列表"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium" style={{ writingMode: 'vertical-rl' }}>
              {getListTitle()}
            </div>
          </div>
          <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
            {filteredNotes.length}
          </div>
        </div>
      ) : (
        /* Expanded State */
        <>
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1">
                {getListTitle()} ({filteredNotes.length})
              </h3>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
                title="折叠笔记列表"
              >
                <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleCreateFolder}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="新建文件夹"
              >
                <FolderPlus size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="搜索便签..."
            value={filter.searchQuery}
            onChange={(e) => setFilter({ searchQuery: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredNotes.length === 0 && filteredFolders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无便签</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Folders */}
            {filteredFolders.map((folder) => {
              const folderNotes = notesByFolder[folder.id] || []
              const isExpanded = expandedFolders.has(folder.id)
              const isEditing = editingFolderId === folder.id
              const folderProject = projects.find(p => p.id === folder.projectId)
              const folderType = types.find(t => t.id === folder.typeId)
              const showTags = !filter.projectId && !filter.typeId && filter.tagIds.length === 0
              
              return (
                <div key={folder.id} className="space-y-1.5">
                  {/* Folder Header */}
                  <div 
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    onContextMenu={(e) => handleContextMenu(e, folder.id)}
                  >
                    <button 
                      onClick={() => toggleFolder(folder.id)}
                      className="p-0 hover:bg-transparent"
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRightIcon size={16} className="text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                    <Folder size={16} className="text-yellow-600 dark:text-yellow-500" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editingFolderName}
                        onChange={(e) => setEditingFolderName(e.target.value)}
                        onBlur={saveRenameFolder}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRenameFolder()
                          if (e.key === 'Escape') {
                            setEditingFolderId(null)
                            setEditingFolderName('')
                          }
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 bg-white dark:bg-gray-900 border border-blue-500 rounded text-sm focus:outline-none"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex-1 flex items-center gap-1.5" onClick={() => toggleFolder(folder.id)}>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {folder.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {showTags && folderProject && (
                            <span 
                              className="px-1.5 py-0.5 text-xs rounded"
                              style={{ 
                                backgroundColor: `${folderProject.color}20`,
                                color: folderProject.color,
                                border: `1px solid ${folderProject.color}40`
                              }}
                            >
                              {folderProject.name}
                            </span>
                          )}
                          {showTags && folderType && (
                            <span 
                              className="px-1.5 py-0.5 text-xs rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                            >
                              {folderType.name}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {folderNotes.length}
                    </span>
                  </div>
                  
                  {/* Folder Notes */}
                  {isExpanded && (
                    <div className="ml-3 space-y-1.5">
                      {folderNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setCurrentNote(note.id)}
                          className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                            currentNoteId === note.id
                              ? 'bg-white dark:bg-gray-800 shadow-lg border-blue-500 dark:border-blue-600'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          {/* Title and Pin */}
                          <div className="flex items-center justify-between mb-1.5">
                            <h4 className="flex-1 font-medium text-sm text-gray-900 dark:text-white truncate pr-2">
                              {note.title}
                            </h4>
                            {note.isPinned && (
                              <Pin size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0 fill-current" />
                            )}
                          </div>

                          {/* Content Preview */}
                          {note.content && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2 leading-relaxed">
                              {note.content}
                            </p>
                          )}

                          {/* Tags and Time in one row */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Tags */}
                            {note.tagIds.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {note.tagIds.slice(0, 2).map((tagId) => {
                                  const tag = tags.find((t) => t.id === tagId)
                                  if (!tag) return null
                                  const tagColor = getTagColor(tag.name)
                                  return (
                                    <span
                                      key={tag.id}
                                      className={`px-1.5 py-0.5 text-xs rounded border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                                    >
                                      #{tag.name}
                                    </span>
                                  )
                                })}
                                {note.tagIds.length > 2 && (
                                  <span className="px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600">
                                    +{note.tagIds.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div />
                            )}

                            {/* Time */}
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                              <Clock size={11} />
                              <span>{formatDetailedDate(note.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Notes without folder */}
            {notesWithoutFolder.map((note) => (
              <div
                key={note.id}
                onClick={() => setCurrentNote(note.id)}
                className={`p-2.5 rounded-lg cursor-pointer transition-all duration-200 border ${
                  currentNoteId === note.id
                    ? 'bg-white dark:bg-gray-800 shadow-lg border-blue-500 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {/* Title and Pin */}
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="flex-1 font-medium text-sm text-gray-900 dark:text-white truncate pr-2">
                    {note.title}
                  </h4>
                  {note.isPinned && (
                    <Pin size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0 fill-current" />
                  )}
                </div>

                {/* Content Preview */}
                {note.content && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2 leading-relaxed">
                    {note.content}
                  </p>
                )}

                {/* Tags and Time in one row */}
                <div className="flex items-center justify-between gap-2">
                  {/* Tags */}
                  {note.tagIds.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {note.tagIds.slice(0, 2).map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId)
                        if (!tag) return null
                        const tagColor = getTagColor(tag.name)
                        return (
                          <span
                            key={tag.id}
                            className={`px-1.5 py-0.5 text-xs rounded border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                          >
                            #{tag.name}
                          </span>
                        )
                      })}
                      {note.tagIds.length > 2 && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded border border-gray-200 dark:border-gray-600">
                          +{note.tagIds.length - 2}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
                    <Clock size={11} />
                    <span>{formatDetailedDate(note.updatedAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Context Menu for Folder */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-[160px] z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleCreateNote(contextMenu.folderId)
              setContextMenu(null)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus size={16} />
            <span>新增便签</span>
          </button>
          <button
            onClick={() => {
              const folder = folders.find(f => f.id === contextMenu.folderId)
              if (folder) handleRenameFolder(contextMenu.folderId, folder.name)
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>重命名</span>
          </button>
          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
          <button
            onClick={() => handleDeleteFolder(contextMenu.folderId)}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span>删除文件夹</span>
          </button>
        </div>
      )}
        </>
      )}
      
      {/* Folder Modal */}
      <FolderModal isOpen={folderModalOpen} onClose={() => setFolderModalOpen(false)} />
    </div>
  )
}
