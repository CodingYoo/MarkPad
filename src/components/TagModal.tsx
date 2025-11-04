import { useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'
import { Trash2, Edit2, Check, X, Tag } from 'lucide-react'
import { Tag as TagType } from '../types'

interface TagModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TagModal = ({ isOpen, onClose }: TagModalProps) => {
  const { tags, createTag, updateTag, deleteTag } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!newName.trim()) return
    createTag(newName.trim())
    setNewName('')
    setIsAdding(false)
  }

  const handleEdit = (tag: TagType) => {
    setEditingId(tag.id)
    setNewName(tag.name)
  }

  const handleUpdate = () => {
    if (!newName.trim() || !editingId) return
    updateTag(editingId, newName.trim())
    setEditingId(null)
    setNewName('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewName('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个标签吗？关联的便签不会被删除。')) {
      deleteTag(id)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="标签管理">
      <div className="space-y-3">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            {editingId === tag.id ? (
              <>
                <Tag size={18} className="text-gray-600 dark:text-gray-400" />
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
                <Tag size={18} className="text-gray-600 dark:text-gray-400" />
                <span className="flex-1 text-gray-900 dark:text-white">
                  {tag.name}
                </span>
                <button
                  onClick={() => handleEdit(tag)}
                  className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
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
            <Tag size={18} className="text-gray-600 dark:text-gray-400" />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancel()
              }}
              placeholder="标签名称..."
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
            + 添加标签
          </button>
        )}
      </div>
    </Modal>
  )
}
