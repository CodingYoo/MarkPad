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
  const [newGroup, setNewGroup] = useState<string>('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!newName.trim()) return
    createTag(newName.trim(), newGroup || undefined)
    setNewName('')
    setNewGroup('')
    setIsAdding(false)
  }

  const handleEdit = (tag: TagType) => {
    setEditingId(tag.id)
    setNewName(tag.name)
    setNewGroup(tag.group || '')
  }

  const handleUpdate = () => {
    if (!newName.trim() || !editingId) return
    updateTag(editingId, newName.trim(), newGroup || undefined)
    setEditingId(null)
    setNewName('')
    setNewGroup('')
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewName('')
    setNewGroup('')
  }

  // Get unique groups
  const groups = Array.from(new Set(tags.filter(t => t.group).map(t => t.group)))

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
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    placeholder="标签名称"
                    className="w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate()
                      if (e.key === 'Escape') handleCancel()
                    }}
                    placeholder="分组名（可选，同组标签互斥）"
                    list="groups"
                    className="w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="groups">
                    {groups.map(g => <option key={g} value={g} />)}
                  </datalist>
                </div>
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
                <div className="flex-1">
                  <div className="text-gray-900 dark:text-white">
                    {tag.name}
                  </div>
                  {tag.group && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      分组: {tag.group}
                    </div>
                  )}
                </div>
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
            <div className="flex-1 space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="标签名称"
                className="w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <input
                type="text"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') handleCancel()
                }}
                placeholder="分组名（可选，同组标签互斥）"
                list="groups"
                className="w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="groups">
                {groups.map(g => <option key={g} value={g} />)}
              </datalist>
            </div>
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
