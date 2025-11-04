import { useEffect, useState } from 'react'
import { X, Trash2, Copy, Image as ImageIcon } from 'lucide-react'
import { Modal } from './Modal'
import { convertToAssetUrl } from '../utils/imageHelper'

interface ImageInfo {
  filename: string
  path: string
  size: number
  created_at: number
}

interface ImageGalleryProps {
  isOpen: boolean
  onClose: () => void
}

export const ImageGallery = ({ isOpen, onClose }: ImageGalleryProps) => {
  const [images, setImages] = useState<ImageInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<ImageInfo | null>(null)

  const loadImages = async () => {
    setLoading(true)
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      console.log('Loading images from Tauri...')
      const imageList = await invoke('get_images') as ImageInfo[]
      console.log('Images loaded:', imageList.length, imageList)
      setImages(imageList)
    } catch (error) {
      console.error('Failed to load images:', error)
      console.log('Not in Tauri environment or error loading images')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadImages()
    }
  }, [isOpen])

  const handleDelete = async (image: ImageInfo) => {
    try {
      // Try to use Tauri dialog for better UX
      const { confirm } = await import('@tauri-apps/plugin-dialog')
      const shouldDelete = await confirm(`确定要删除图片 ${image.filename} 吗？`, {
        title: '确认删除',
        kind: 'warning'
      })
      
      if (!shouldDelete) return
    } catch (error) {
      // Fallback to browser confirm
      console.log('Using browser confirm dialog')
      if (!window.confirm(`确定要删除图片 ${image.filename} 吗？`)) return
    }

    try {
      const { invoke } = await import('@tauri-apps/api/core')
      await invoke('delete_image', { path: image.path })
      await loadImages()
      if (selectedImage?.path === image.path) {
        setSelectedImage(null)
      }
      console.log('Image deleted successfully')
    } catch (error) {
      console.error('Failed to delete image:', error)
      alert('删除失败：' + error)
    }
  }

  const handleCopyPath = async (image: ImageInfo) => {
    try {
      console.log('Starting copy operation for:', image.path)
      const assetUrl = await convertToAssetUrl(image.path)
      console.log('Asset URL obtained:', assetUrl)
      
      if (!assetUrl) {
        alert('无法生成图片引用')
        return
      }
      
      const markdown = `![image](${assetUrl})`
      console.log('Markdown to copy:', markdown)
      
      // Try using clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(markdown)
        console.log('Copied using clipboard API')
        alert('图片引用已复制到剪贴板')
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = markdown
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        console.log('Copied using fallback method')
        alert('图片引用已复制到剪贴板')
      }
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('复制失败: ' + error)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = async (path: string) => {
    return await convertToAssetUrl(path)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ImageIcon size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              图片管理
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({images.length} 张)
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">加载中...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <ImageIcon size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无图片</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                在编辑器中粘贴图片即可自动上传
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image) => (
                <ImageCard
                  key={image.path}
                  image={image}
                  onDelete={handleDelete}
                  onCopy={handleCopyPath}
                  onClick={() => setSelectedImage(image)}
                  formatDate={formatDate}
                  formatSize={formatSize}
                  getImageUrl={getImageUrl}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <Modal isOpen={true} onClose={() => setSelectedImage(null)} showHeader={false}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedImage.filename}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(selectedImage)}
                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  title="删除图片"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <ImagePreview path={selectedImage.path} getImageUrl={getImageUrl} />
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}

interface ImageCardProps {
  image: ImageInfo
  onDelete: (image: ImageInfo) => void
  onCopy: (image: ImageInfo) => void
  onClick: () => void
  formatDate: (timestamp: number) => string
  formatSize: (bytes: number) => string
  getImageUrl: (path: string) => Promise<string>
}

const ImageCard = ({ image, onDelete, onCopy, onClick, formatDate, formatSize, getImageUrl }: ImageCardProps) => {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    getImageUrl(image.path)
      .then((url) => {
        console.log('Image URL loaded:', url)
        setImageUrl(url)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load image URL:', err)
        setError(true)
        setLoading(false)
      })
  }, [image.path])

  return (
    <div 
      className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-blue-500 transition cursor-pointer"
      onClick={onClick}
    >
      {/* Image */}
      <div className="w-full h-full flex items-center justify-center">
        {loading ? (
          <span className="text-gray-400 text-sm">加载中...</span>
        ) : error ? (
          <span className="text-red-400 text-sm">加载失败</span>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt={image.filename}
            className="w-full h-full object-cover"
            onError={() => {
              console.error('Image failed to load:', imageUrl)
              setError(true)
            }}
          />
        ) : (
          <span className="text-gray-400 text-sm">无图片</span>
        )}
      </div>
      
      {/* Overlay with buttons */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onCopy(image)
          }}
          className="p-2.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg"
          title="复制引用"
        >
          <Copy size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(image)
          }}
          className="p-2.5 bg-white dark:bg-gray-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors shadow-lg"
          title="删除"
        >
          <Trash2 size={20} className="text-red-600 dark:text-red-400" />
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
        <p className="text-xs text-white truncate">{image.filename}</p>
        <div className="flex items-center justify-between text-xs text-gray-300 mt-1">
          <span>{formatSize(image.size)}</span>
          <span>{formatDate(image.created_at)}</span>
        </div>
      </div>
    </div>
  )
}

interface ImagePreviewProps {
  path: string
  getImageUrl: (path: string) => Promise<string>
}

const ImagePreview = ({ path, getImageUrl }: ImagePreviewProps) => {
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getImageUrl(path)
      .then((url) => {
        console.log('Preview image URL:', url)
        setImageUrl(url)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [path])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">加载中...</p>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-[70vh] object-contain rounded-lg"
          onError={() => console.error('Preview image failed to load')}
        />
      ) : (
        <p className="text-gray-500 dark:text-gray-400">无法加载图片</p>
      )}
    </div>
  )
}
