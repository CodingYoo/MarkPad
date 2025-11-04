import { useState } from 'react'
import { useStore } from '../store'
import { Modal } from './Modal'

interface FolderModalProps {
  isOpen: boolean
  onClose: () => void
}

export const FolderModal = ({ isOpen, onClose }: FolderModalProps) => {
  const { createFolder } = useStore()
  const [folderName, setFolderName] = useState('')

  const handleCreate = () => {
    if (folderName.trim()) {
      createFolder(folderName.trim())
      setFolderName('')
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新建文件夹">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          文件夹名称
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') onClose()
            }}
            placeholder="输入文件夹名称"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
          >
            创建
          </button>
        </div>
      </div>
    </Modal>
  )
}
