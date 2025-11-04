import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../store'
import { Pin, Trash2, Save, MoreVertical } from 'lucide-react'

export const Editor = () => {
  const { notes, currentNoteId, updateNote, deleteNote, togglePinNote, projects, types, tags } = useStore()
  const currentNote = notes.find((note) => note.id === currentNoteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title)
      setContent(currentNote.content)
    }
  }, [currentNote])

  useEffect(() => {
    if (!currentNote) return

    const timer = setTimeout(() => {
      if (title !== currentNote.title || content !== currentNote.content) {
        updateNote(currentNote.id, { title, content })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [title, content, currentNote, updateNote])

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    console.log('=== Paste event triggered ===')
    console.log('Clipboard items count:', items.length)

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`Item ${i} type:`, item.type)
      
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        console.log('Image detected, preventing default')
        
        const file = item.getAsFile()
        if (!file) {
          console.log('Failed to get file from clipboard item')
          continue
        }

        console.log('File obtained:', file.name, file.size, file.type)

        const reader = new FileReader()
        reader.onload = async (event) => {
          const base64Data = event.target?.result as string
          console.log('Base64 data loaded, length:', base64Data.length)
          
          let imageMarkdown = ''

          // Try to import Tauri API to check if in Tauri environment
          console.log('Attempting to import Tauri API...')
          try {
            const { invoke, convertFileSrc } = await import('@tauri-apps/api/core')
            console.log('Tauri API imported successfully - running in Tauri environment')
            
            const extension = file.type.split('/')[1] || 'png'
            console.log('Saving image with extension:', extension)
            
            const filePath = await invoke('save_image', { 
              imageData: base64Data, 
              extension 
            }) as string
            
            console.log('Image saved to:', filePath)
            
            const assetUrl = convertFileSrc(filePath)
            console.log('Asset URL:', assetUrl)
            
            imageMarkdown = `![image](${assetUrl})\n`
            console.log('Image markdown created:', imageMarkdown)
          } catch (error) {
            // If Tauri API import fails, we're in browser environment
            console.log('Tauri API not available, using base64 fallback')
            console.error('Error details:', error)
            imageMarkdown = `![image](${base64Data})\n`
          }
          
          const textarea = textareaRef.current
          if (!textarea) return

          const start = textarea.selectionStart
          const end = textarea.selectionEnd
          const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
          
          setContent(newContent)
          
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + imageMarkdown.length
            textarea.focus()
          }, 0)
        }
        
        reader.readAsDataURL(file)
        break
      }
    }
  }

  if (!currentNote) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">未选择便签</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            请从左侧列表选择或创建一个便签
          </p>
        </div>
      </div>
    )
  }

  const project = projects.find((p) => p.id === currentNote.projectId)
  const type = types.find((t) => t.id === currentNote.typeId)
  const noteTags = tags.filter((tag) => currentNote.tagIds.includes(tag.id))

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {project && (
            <span
              className="px-2 py-1 text-xs rounded"
              style={{ backgroundColor: project.color + '20', color: project.color }}
            >
              {project.name}
            </span>
          )}
          {type && (
            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
              {type.name}
            </span>
          )}
          {noteTags.map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
            >
              {tag.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => togglePinNote(currentNote.id)}
            className={`p-2 rounded-lg transition ${
              currentNote.isPinned
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="置顶"
          >
            <Pin size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm('确定要删除这个便签吗？')) {
                deleteNote(currentNote.id)
              }
            }}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="删除"
          >
            <Trash2 size={18} />
          </button>
          <button
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="更多选项"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="便签标题..."
          className="w-full text-2xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
        />
      </div>

      {/* Toggle Preview */}
      <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1 text-sm rounded transition ${
              !showPreview
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1 text-sm rounded transition ${
              showPreview
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            预览
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showPreview ? (
          <div className="px-6 py-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({node, ...props}) => (
                  <img 
                    {...props} 
                    className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700"
                    style={{ display: 'block', margin: '1rem 0' }}
                  />
                )
              }}
            >
              {content || '*暂无内容*'}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            placeholder="开始编写你的便签... 支持 Markdown 语法（支持粘贴图片）"
            className="w-full h-full px-6 py-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-500">
          字数: {content.length}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <Save size={14} />
          <span>自动保存</span>
        </div>
      </div>
    </div>
  )
}
