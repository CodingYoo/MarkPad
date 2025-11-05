import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../store'
import { Pin, Trash2, Save, MoreVertical, Maximize, X, Plus, FileDown } from 'lucide-react'
import { ContextMenu } from './ContextMenu'
import { ExportProgress } from './ExportProgress'
import { getTagColor } from '../utils'

export const Editor = () => {
  const { notes, currentNoteId, updateNote, deleteNote, togglePinNote, projects, types, tags } = useStore()
  const currentNote = notes.find((note) => note.id === currentNoteId)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [splitMode, setSplitMode] = useState(false)
  const [fullscreenPreview, setFullscreenPreview] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showTagMenu, setShowTagMenu] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showExportProgress, setShowExportProgress] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

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

  // Handle ESC key to exit fullscreen and close menus
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (fullscreenPreview) {
          setFullscreenPreview(false)
        } else if (showTagMenu) {
          setShowTagMenu(false)
        } else if (showExportMenu) {
          setShowExportMenu(false)
        }
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (showTagMenu) {
        setShowTagMenu(false)
      }
      if (showExportMenu && exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    if (showTagMenu || showExportMenu) {
      // Delay adding the click listener to avoid immediate closure
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 100)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [fullscreenPreview, showTagMenu, showExportMenu])

  const handleContextMenu = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Context menu triggered at:', e.clientX, e.clientY)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const handleExportMarkdown = async () => {
    console.log('=== Export Markdown Debug Info ===')
    
    if (!currentNote) {
      console.warn('No note selected')
      setShowExportMenu(false)
      return
    }

    const markdown = `# ${title}\n\n${content}`
    console.log('Markdown content created, length:', markdown.length)

    try {
      // 尝试导入 Tauri 插件来检测是否在 Tauri 环境中
      console.log('Attempting to use Tauri plugins...')
      
      try {
        const dialogModule = await import('@tauri-apps/plugin-dialog')
        const fsModule = await import('@tauri-apps/plugin-fs')
        
        console.log('>>> Tauri plugins loaded, entering Tauri mode...')
        console.log('dialog.save:', typeof dialogModule.save)
        console.log('fs.writeTextFile:', typeof fsModule.writeTextFile)
        
        console.log('Calling save dialog...')
        const filePath = await dialogModule.save({
          defaultPath: `${title || '未命名'}.md`,
          filters: [{ 
            name: 'Markdown', 
            extensions: ['md', 'markdown'] 
          }]
        })
        
        console.log('Save dialog returned:', filePath)
        
        if (filePath) {
          console.log('Writing file to:', filePath)
          await fsModule.writeTextFile(filePath, markdown)
          console.log('File saved successfully!')
          alert('文件保存成功！')
        } else {
          console.log('User cancelled save dialog')
        }
      } catch (tauriError) {
        // Tauri 插件加载失败，使用浏览器模式
        console.log('>>> Tauri not available, falling back to browser download mode...')
        console.log('Tauri error:', tauriError)
        
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title || '未命名'}.md`
        a.style.display = 'none'
        
        document.body.appendChild(a)
        console.log('Triggering browser download...')
        a.click()
        
        setTimeout(() => {
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
          console.log('Download completed - check your Downloads folder')
        }, 100)
      }
      
    } catch (error) {
      console.error('Export markdown failed:', error)
      alert('导出失败：' + (error instanceof Error ? error.message : String(error)))
    }
    
    setShowExportMenu(false)
  }

  const handleExportPDF = async () => {
    console.log('handleExportPDF called', { 
      currentNote, 
      title, 
      contentLength: content.length 
    })
    
    if (!currentNote) {
      console.warn('No note selected')
      setShowExportMenu(false)
      return
    }

    setShowExportMenu(false)
    setShowExportProgress(true)

    try {
      // 尝试使用 Tauri 导出API
      const { invoke } = await import('@tauri-apps/api/core')
      const { save } = await import('@tauri-apps/plugin-dialog')
      
      console.log('>>> Using Tauri backend for PDF export...')
      
      // 打开保存对话框
      const filePath = await save({
        defaultPath: `${title || '未命名'}.pdf`,
        filters: [{ 
          name: 'PDF', 
          extensions: ['pdf'] 
        }]
      })
      
      if (!filePath) {
        console.log('User cancelled save dialog')
        setShowExportProgress(false)
        return
      }
      
      console.log('Selected file path:', filePath)
      
      // 调用后端导出命令
      await invoke('export_pdf', {
        title: title || '未命名',
        content: content || '',
        outputPath: filePath
      })
      
      console.log('PDF export completed successfully')
      
    } catch (error) {
      console.error('Export PDF failed:', error)
      setShowExportProgress(false)
      alert('导出 PDF 失败：' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const insertMarkdown = (action: string, value?: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    let insertText = ''
    let cursorOffset = 0

    switch (action) {
      case 'heading':
        const level = value || '1'
        insertText = `${'#'.repeat(parseInt(level))} ${selectedText || '标题'}\n`
        cursorOffset = insertText.length - 1
        break
      
      case 'bold':
        insertText = `**${selectedText || '粗体文字'}**`
        cursorOffset = selectedText ? insertText.length : insertText.length - 2
        break
      
      case 'italic':
        insertText = `*${selectedText || '斜体文字'}*`
        cursorOffset = selectedText ? insertText.length : insertText.length - 1
        break
      
      case 'inline-code':
        insertText = `\`${selectedText || '代码'}\``
        cursorOffset = selectedText ? insertText.length : insertText.length - 1
        break
      
      case 'strikethrough':
        insertText = `~~${selectedText || '删除线'}~~`
        cursorOffset = selectedText ? insertText.length : insertText.length - 2
        break
      
      case 'link':
        insertText = `[${selectedText || '链接文字'}](url)`
        cursorOffset = insertText.length - 4
        break
      
      case 'image':
        insertText = `![${selectedText || '图片描述'}](url)`
        cursorOffset = insertText.length - 4
        break
      
      case 'unordered-list':
        insertText = `- ${selectedText || '列表项'}\n`
        cursorOffset = insertText.length
        break
      
      case 'ordered-list':
        insertText = `1. ${selectedText || '列表项'}\n`
        cursorOffset = insertText.length
        break
      
      case 'task-list':
        insertText = `- [ ] ${selectedText || '任务项'}\n`
        cursorOffset = insertText.length
        break
      
      case 'quote':
        insertText = `> ${selectedText || '引用内容'}\n`
        cursorOffset = insertText.length
        break
      
      case 'code-block':
        insertText = `\`\`\`javascript\n${selectedText || '// 代码'}\n\`\`\`\n`
        cursorOffset = selectedText ? insertText.length : 16
        break
      
      case 'table':
        insertText = `| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n`
        cursorOffset = insertText.length
        break
      
      case 'horizontal-rule':
        insertText = `\n---\n`
        cursorOffset = insertText.length
        break
    }

    const newContent = content.substring(0, start) + insertText + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + cursorOffset
    }, 0)
  }

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

  // Render fullscreen preview
  if (fullscreenPreview) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title || '无标题'}
          </h3>
          <button
            onClick={() => setFullscreenPreview(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            title="退出全屏 (ESC)"
          >
            <X size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Fullscreen Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8 prose prose-lg dark:prose-invert">
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
        </div>
      </div>
    )
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

  const toggleTag = (tagId: string) => {
    if (!currentNote) return
    
    const selectedTag = tags.find(t => t.id === tagId)
    if (!selectedTag) return

    let newTagIds: string[]
    
    if (currentNote.tagIds.includes(tagId)) {
      // 取消选择该标签
      newTagIds = currentNote.tagIds.filter(id => id !== tagId)
    } else {
      // 选择该标签
      if (selectedTag.group) {
        // 如果标签属于某个组，先移除同组的其他标签
        const groupTagIds = tags
          .filter(t => t.group === selectedTag.group)
          .map(t => t.id)
        newTagIds = currentNote.tagIds.filter(id => !groupTagIds.includes(id))
        newTagIds.push(tagId)
      } else {
        // 普通标签，直接添加
        newTagIds = [...currentNote.tagIds, tagId]
      }
    }
    
    updateNote(currentNote.id, { tagIds: newTagIds })
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
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
          {noteTags.map((tag) => {
            const tagColor = getTagColor(tag.name)
            return (
              <span
                key={tag.id}
                className={`px-2.5 py-1 text-xs font-medium rounded-full border flex items-center gap-1 ${tagColor.bg} ${tagColor.text} ${tagColor.border}`}
              >
                #{tag.name}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleTag(tag.id)
                  }}
                  className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 transition"
                  type="button"
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowTagMenu(!showTagMenu)
              }}
              className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-1"
            >
              <Plus size={12} />
              添加标签
            </button>
            {showTagMenu && (
              <div 
                className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-[200px] max-h-[400px] overflow-y-auto z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {tags.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    暂无标签
                  </div>
                ) : (
                  (() => {
                    // 按组分类标签
                    const groupedTags: Record<string, typeof tags> = {}
                    const ungroupedTags: typeof tags = []
                    
                    tags.forEach(tag => {
                      if (tag.group) {
                        if (!groupedTags[tag.group]) {
                          groupedTags[tag.group] = []
                        }
                        groupedTags[tag.group].push(tag)
                      } else {
                        ungroupedTags.push(tag)
                      }
                    })

                    return (
                      <>
                        {/* 分组标签 */}
                        {Object.entries(groupedTags).map(([groupName, groupTags]) => (
                          <div key={groupName}>
                            <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30">
                              {groupName}
                            </div>
                            {groupTags.map((tag) => {
                              const isSelected = currentNote?.tagIds.includes(tag.id)
                              const tagColor = getTagColor(tag.name)
                              return (
                                <button
                                  key={tag.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleTag(tag.id)
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                                    isSelected ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                                  }`}
                                >
                                  <div className={`w-3 h-3 rounded-full border-2 ${isSelected ? tagColor.border : 'border-gray-300 dark:border-gray-600'}`}>
                                    {isSelected && (
                                      <div className={`w-full h-full rounded-full ${tagColor.bg}`} />
                                    )}
                                  </div>
                                  <span className={`flex-1 text-left ${tagColor.text}`}>#{tag.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        ))}
                        
                        {/* 未分组标签 */}
                        {ungroupedTags.length > 0 && (
                          <div>
                            {Object.keys(groupedTags).length > 0 && (
                              <div className="px-4 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30">
                                其他
                              </div>
                            )}
                            {ungroupedTags.map((tag) => {
                              const isSelected = currentNote?.tagIds.includes(tag.id)
                              const tagColor = getTagColor(tag.name)
                              return (
                                <button
                                  key={tag.id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleTag(tag.id)
                                  }}
                                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                                    isSelected ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                                  }`}
                                >
                                  <div className={`w-3 h-3 rounded-full border-2 ${isSelected ? tagColor.border : 'border-gray-300 dark:border-gray-600'}`}>
                                    {isSelected && (
                                      <div className={`w-full h-full rounded-full ${tagColor.bg}`} />
                                    )}
                                  </div>
                                  <span className={`flex-1 text-left ${tagColor.text}`}>#{tag.name}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </>
                    )
                  })()
                )}
              </div>
            )}
          </div>
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
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowExportMenu(!showExportMenu)
              }}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              title="更多选项"
            >
              <MoreVertical size={18} />
            </button>
            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    console.log('Export MD button clicked')
                    e.stopPropagation()
                    handleExportMarkdown()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileDown size={16} className="text-blue-500" />
                  <span>导出为 MD</span>
                </button>
                <button
                  onClick={(e) => {
                    console.log('Export PDF button clicked')
                    e.stopPropagation()
                    handleExportPDF()
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileDown size={16} className="text-red-500" />
                  <span>导出为 PDF</span>
                </button>
              </div>
            )}
          </div>
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
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowPreview(false)
                setSplitMode(false)
              }}
              className={`px-3 py-1 text-sm rounded transition ${
                !showPreview && !splitMode
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              编辑
            </button>
            <button
              onClick={() => {
                setShowPreview(true)
                setSplitMode(false)
              }}
              className={`px-3 py-1 text-sm rounded transition ${
                showPreview && !splitMode
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              预览
            </button>
            <button
              onClick={() => {
                setSplitMode(true)
                setShowPreview(false)
              }}
              className={`px-3 py-1 text-sm rounded transition ${
                splitMode
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              分屏
            </button>
          </div>
          {(showPreview || splitMode) && (
            <button
              onClick={() => setFullscreenPreview(true)}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title="全屏预览"
            >
              <Maximize size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {splitMode ? (
          /* Split Mode: Editor + Preview */
          <>
            <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                onContextMenu={handleContextMenu}
                placeholder="开始编写你的便签... 支持 Markdown 语法（支持粘贴图片）（右键插入元素）"
                className="w-full h-full px-6 py-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
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
            </div>
          </>
        ) : showPreview ? (
          /* Preview Only */
          <div className="flex-1 overflow-y-auto">
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
          </div>
        ) : (
          /* Edit Only */
          <div className="flex-1 overflow-y-auto">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              onContextMenu={handleContextMenu}
              placeholder="开始编写你的便签... 支持 Markdown 语法（支持粘贴图片）（右键插入元素）"
              className="w-full h-full px-6 py-4 bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
            />
          </div>
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

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onSelect={insertMarkdown}
        />
      )}

      {/* Export Progress */}
      <ExportProgress
        isOpen={showExportProgress}
        onClose={() => setShowExportProgress(false)}
      />
    </div>
  )
}
