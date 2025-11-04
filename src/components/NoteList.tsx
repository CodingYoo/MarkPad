import { useMemo, useEffect, useState } from 'react'
import { useStore } from '../store'
import { formatDetailedDate, getTagColor } from '../utils'
import { Plus, Search, Pin, ChevronLeft, ChevronRight, Clock, Folder, FolderPlus, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react'

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
    createFolder,
    updateFolder,
    deleteFolder,
    setFilter,
  } = useStore()
  
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; folderId: string } | null>(null)

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
    const folderName = prompt('请输入文件夹名称')
    if (folderName && folderName.trim()) {
      createFolder(folderName.trim())
    }
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
        withoutFolder.push(note)
      }
    })
    
    return { notesWithoutFolder: withoutFolder, notesByFolder: byFolder }
  }, [filteredNotes])

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
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
                title="新建文件夹"
              >
                <FolderPlus size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => handleCreateNote(null)}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                title="新建文章"
              >
                <Plus size={20} />
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
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">暂无便签</p>
            <button
              onClick={() => handleCreateNote(null)}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              创建第一个便签
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Folders */}
            {folders.map((folder) => {
              const folderNotes = notesByFolder[folder.id] || []
              const isExpanded = expandedFolders.has(folder.id)
              const isEditing = editingFolderId === folder.id
              
              return (
                <div key={folder.id} className="space-y-2">
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
                      <span 
                        className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                        onClick={() => toggleFolder(folder.id)}
                      >
                        {folder.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {folderNotes.length}
                    </span>
                  </div>
                  
                  {/* Folder Notes */}
                  {isExpanded && (
                    <div className="ml-4 space-y-2">
                      {folderNotes.map((note) => (
                        <div
                          key={note.id}
                          onClick={() => setCurrentNote(note.id)}
                          className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                            currentNoteId === note.id
                              ? 'bg-white dark:bg-gray-800 shadow-lg border-blue-500 dark:border-blue-600'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          {/* Title and Pin */}
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="flex-1 font-semibold text-base text-gray-900 dark:text-white truncate pr-2">
                              {note.title}
                            </h4>
                            {note.isPinned && (
                              <Pin size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0 fill-current" />
                            )}
                          </div>

                          {/* Content Preview */}
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                            {note.content || '无内容'}
                          </p>

                          {/* Tags and Time */}
                          <div className="space-y-2">
                            {/* Tags */}
                            {note.tagIds.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {note.tagIds.slice(0, 3).map((tagId) => {
                                  const tag = tags.find((t) => t.id === tagId)
                                  if (!tag) return null
                                  const tagColor = getTagColor(tag.name)
                                  return (
                                    <span
                                      key={tag.id}
                                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                                    >
                                      #{tag.name}
                                    </span>
                                  )
                                })}
                                {note.tagIds.length > 3 && (
                                  <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-600">
                                    +{note.tagIds.length - 3}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Time */}
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                              <Clock size={12} />
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
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border ${
                  currentNoteId === note.id
                    ? 'bg-white dark:bg-gray-800 shadow-lg border-blue-500 dark:border-blue-600'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                {/* Title and Pin */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="flex-1 font-semibold text-base text-gray-900 dark:text-white truncate pr-2">
                    {note.title}
                  </h4>
                  {note.isPinned && (
                    <Pin size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0 fill-current" />
                  )}
                </div>

                {/* Content Preview */}
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {note.content || '无内容'}
                </p>

                {/* Tags and Time */}
                <div className="space-y-2">
                  {/* Tags */}
                  {note.tagIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {note.tagIds.slice(0, 3).map((tagId) => {
                        const tag = tags.find((t) => t.id === tagId)
                        if (!tag) return null
                        const tagColor = getTagColor(tag.name)
                        return (
                          <span
                            key={tag.id}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
                          >
                            #{tag.name}
                          </span>
                        )
                      })}
                      {note.tagIds.length > 3 && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded-full border border-gray-200 dark:border-gray-600">
                          +{note.tagIds.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500">
                    <Clock size={12} />
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
            <span>新建文章</span>
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
    </div>
  )
}
