import { useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'
import { Trash2, Edit2, Check, X } from 'lucide-react'

interface FolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FolderModal = ({ isOpen, onClose }: FolderModalProps) => {
  const { folders, createFolder, updateFolder, deleteFolder } = useStore()
  const [folderName, setFolderName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const handleCreate = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim())
      setFolderName('')
    }
  }

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditingName(name)
  }

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      updateFolder(editingId, editingName.trim())
      setEditingId(null)
      setEditingName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  const handleDelete = (id: string) => {
    if (confirm('确定删除此文件夹吗？文件夹内的文章将移至根目录。')) {
      deleteFolder(id)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="文件夹管理">
      <div className="space-y-4">
        {/* Create New Folder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            新建文件夹
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              placeholder="输入文件夹名称"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
            >
              创建
            </button>
          </div>
        </div>

        {/* Folders List */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            已有文件夹
          </label>
          {folders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              暂无文件夹
            </p>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {editingId === folder.id ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit()
                          if (e.key === 'Escape') handleCancelEdit()
                        }}
                        className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none dark:bg-gray-600 dark:text-white"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-600 hover:text-gray-700 dark:text-gray-400"
                      >
                        <X size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-gray-900 dark:text-white">
                        {folder.name}
                      </span>
                      <button
                        onClick={() => handleStartEdit(folder.id, folder.name)}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(folder.id)}
                        className="p-1 text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
