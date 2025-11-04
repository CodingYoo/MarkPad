import { useState } from 'react'
import { useStore } from '../store'
import { FolderOpen, Tag, CheckSquare, FileText, Lightbulb, Users, Plus } from 'lucide-react'
import { ProjectModal } from './ProjectModal'
import { TypeModal } from './TypeModal'
import { TagModal } from './TagModal'

export const Sidebar = () => {
  const { projects, types, tags, filter, setFilter, resetFilter } = useStore()
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [typeModalOpen, setTypeModalOpen] = useState(false)
  const [tagModalOpen, setTagModalOpen] = useState(false)

  const iconMap: Record<string, typeof CheckSquare> = {
    CheckSquare,
    FileText,
    Lightbulb,
    Users,
  }

  return (
    <>
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
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
          <FileText size={18} />
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
                  <Icon size={18} />
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
          <div className="space-y-1">
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  const isSelected = filter.tagIds.includes(tag.id)
                  setFilter({
                    tagIds: isSelected
                      ? filter.tagIds.filter((id) => id !== tag.id)
                      : [...filter.tagIds, tag.id],
                  })
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                  filter.tagIds.includes(tag.id)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Tag size={18} />
                <span className="flex-1 text-left truncate">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>

      {/* Modals */}
      <ProjectModal isOpen={projectModalOpen} onClose={() => setProjectModalOpen(false)} />
      <TypeModal isOpen={typeModalOpen} onClose={() => setTypeModalOpen(false)} />
      <TagModal isOpen={tagModalOpen} onClose={() => setTagModalOpen(false)} />
    </>
  )
}
