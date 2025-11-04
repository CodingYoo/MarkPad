import { useMemo, useEffect, useState } from 'react'
import { useStore } from '../store'
import { formatDate } from '../utils'
import { Plus, Search, Pin, ChevronLeft, ChevronRight } from 'lucide-react'

export const NoteList = () => {
  const {
    notes,
    tags,
    projects,
    types,
    filter,
    currentNoteId,
    setCurrentNote,
    createNote,
    togglePinNote,
    setFilter,
  } = useStore()
  
  const [isCollapsed, setIsCollapsed] = useState(false)

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

  const handleCreateNote = () => {
    createNote({
      title: '无标题',
      content: '',
      projectId: filter.projectId,
      typeId: filter.typeId,
      tagIds: filter.tagIds,
    })
  }

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
                onClick={handleCreateNote}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
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
              onClick={handleCreateNote}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              创建第一个便签
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setCurrentNote(note.id)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  currentNoteId === note.id
                    ? 'bg-white dark:bg-gray-800 shadow-md'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="flex-1 font-medium text-gray-900 dark:text-white truncate">
                    {note.title}
                  </h4>
                  {note.isPinned && (
                    <Pin size={16} className="text-blue-500 ml-2 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {note.content || '无内容'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tagIds.slice(0, 2).map((tagId) => {
                      const tag = tags.find((t) => t.id === tagId)
                      return tag ? (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                        >
                          {tag.name}
                        </span>
                      ) : null
                    })}
                    {note.tagIds.length > 2 && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        +{note.tagIds.length - 2}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  )
}
