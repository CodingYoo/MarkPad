import { useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'
import { Trash2, Edit2, Check, X, CheckSquare, FileText, Lightbulb, Users, Hash } from 'lucide-react'
import { NoteType } from '../types'

interface TypeModalProps {
  isOpen: boolean
  onClose: () => void
}

const ICONS = [
  { name: 'CheckSquare', component: CheckSquare },
  { name: 'FileText', component: FileText },
  { name: 'Lightbulb', component: Lightbulb },
  { name: 'Users', component: Users },
  { name: 'Hash', component: Hash },
]

export const TypeModal = ({ isOpen, onClose }: TypeModalProps) => {
  const { types, createType, updateType, deleteType } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('CheckSquare')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (!newName.trim()) return
    createType(newName.trim(), newIcon)
    setNewName('')
    setNewIcon('CheckSquare')
    setIsAdding(false)
  }

  const handleEdit = (type: NoteType) => {
    setEditingId(type.id)
    setNewName(type.name)
    setNewIcon(type.icon)
  }

  const handleUpdate = () => {
    if (!newName.trim() || !editingId) return
    updateType(editingId, newName.trim(), newIcon)
    setEditingId(null)
    setNewName('')
    setNewIcon('CheckSquare')
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setNewName('')
    setNewIcon('CheckSquare')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个类型吗？关联的便签不会被删除。')) {
      deleteType(id)
    }
  }

  const getIcon = (iconName: string) => {
    const icon = ICONS.find((i) => i.name === iconName)
    return icon ? icon.component : FileText
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="类型管理">
      <div className="space-y-3">
        {types.map((type) => {
          const Icon = getIcon(type.icon)
          return (
            <div
              key={type.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              {editingId === type.id ? (
                <>
                  <div className="flex gap-2">
                    {ICONS.map((icon) => {
                      const IconComp = icon.component
                      return (
                        <button
                          key={icon.name}
                          onClick={() => setNewIcon(icon.name)}
                          className={`p-2 rounded ${
                            newIcon === icon.name
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          <IconComp size={18} />
                        </button>
                      )
                    })}
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
                  <Icon size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="flex-1 text-gray-900 dark:text-white">
                    {type.name}
                  </span>
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          )
        })}

        {isAdding ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex gap-2">
              {ICONS.map((icon) => {
                const IconComp = icon.component
                return (
                  <button
                    key={icon.name}
                    onClick={() => setNewIcon(icon.name)}
                    className={`p-2 rounded ${
                      newIcon === icon.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    <IconComp size={18} />
                  </button>
                )
              })}
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') handleCancel()
              }}
              placeholder="类型名称..."
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
            + 添加类型
          </button>
        )}
      </div>
    </Modal>
  )
}
