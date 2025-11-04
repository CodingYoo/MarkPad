import { useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { Project } from '../types'

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

export const ProjectModal = ({ isOpen, onClose }: ProjectModalProps) => {
  const { projects, createProject, updateProject, deleteProject } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!newName.trim()) return
    createProject(newName.trim(), newColor)
    setNewName('')
    setNewColor(COLORS[0])
    setIsAdding(false)
  }

  const handleEdit = (project: Project) => {
    setEditingId(project.id)
    setNewName(project.name)
    setNewColor(project.color)
  }

  const handleUpdate = () => {
    if (!newName.trim() || !editingId) return
    updateProject(editingId, newName.trim(), newColor)
    setEditingId(null)
    setNewName('')
    setNewColor(COLORS[0])
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewName('')
    setNewColor(COLORS[0])
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个项目吗？关联的便签不会被删除。')) {
      deleteProject(id)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="项目管理">
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {editingId === project.id ? (
              <>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-6 h-6 rounded border-2 ${
                        newColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleUpdate()
                    if (e.key === 'Escape') handleCancel()
                  }}
                  className="flex-1 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleUpdate}
                  className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: project.color }}
                />
                <span className="flex-1 text-gray-900 dark:text-white">
                  {project.name}
                </span>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`w-6 h-6 rounded border-2 ${
                    newColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancel()
              }}
              placeholder="项目名称..."
              className="flex-1 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
            >
              <Check size={18} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition"
          >
            + 添加项目
          </button>
        )}
      </div>
    </Modal>
  )
}
