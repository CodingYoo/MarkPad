import { useEffect, useState } from 'react'
import { 
  Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
  Bold, Italic, Code, Link,
  List, ListOrdered, CheckSquare,
  Table, Image as ImageIcon, Quote,
  Minus, FileCode, Highlighter
} from 'lucide-react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onSelect: (action: string, value?: string) => void
}

export const ContextMenu = ({ x, y, onClose, onSelect }: ContextMenuProps) => {
  console.log('ContextMenu rendered at:', x, y)
  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null)
  const [position, setPosition] = useState({ x, y })
  
  useEffect(() => {
    // Calculate menu position based on available space
    const menuHeight = 400 // Approximate menu height
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    
    let newX = x
    let newY = y
    
    // Check if menu would go off bottom of screen
    if (y + menuHeight > windowHeight) {
      // Position menu above cursor
      newY = Math.max(10, windowHeight - menuHeight - 10)
    }
    
    // Check if menu would go off right of screen
    if (x + 180 > windowWidth) {
      newX = Math.max(10, windowWidth - 180 - 10)
    }
    
    setPosition({ x: newX, y: newY })
  }, [x, y])
  
  useEffect(() => {
    const handleClick = () => {
      console.log('ContextMenu closing due to click')
      onClose()
    }
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      console.log('ContextMenu closing due to right click')
      onClose()
    }

    // Delay adding event listeners to avoid closing immediately
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClick)
      document.addEventListener('contextmenu', handleContextMenu)
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [onClose])

  const menuItems = [
    { 
      label: '标题', 
      icon: Heading1,
      children: [
        { label: 'H1 - 一级标题', icon: Heading1, action: 'heading', value: '1', shortcut: 'Ctrl+1' },
        { label: 'H2 - 二级标题', icon: Heading2, action: 'heading', value: '2', shortcut: 'Ctrl+2' },
        { label: 'H3 - 三级标题', icon: Heading3, action: 'heading', value: '3', shortcut: 'Ctrl+3' },
        { label: 'H4 - 四级标题', icon: Heading4, action: 'heading', value: '4', shortcut: 'Ctrl+4' },
        { label: 'H5 - 五级标题', icon: Heading5, action: 'heading', value: '5', shortcut: 'Ctrl+5' },
        { label: 'H6 - 六级标题', icon: Heading6, action: 'heading', value: '6', shortcut: 'Ctrl+6' },
      ]
    },
    { type: 'divider' } as const,
    { 
      label: '文本格式', 
      icon: Bold,
      children: [
        { label: '粗体', icon: Bold, action: 'bold', value: undefined, shortcut: 'Ctrl+B' },
        { label: '斜体', icon: Italic, action: 'italic', value: undefined, shortcut: 'Ctrl+I' },
        { label: '删除线', icon: Minus, action: 'strikethrough', value: undefined },
        { label: '高亮', icon: Highlighter, action: 'highlight', value: undefined },
        { label: '行内代码', icon: Code, action: 'inline-code', value: undefined, shortcut: 'Ctrl+`' },
      ]
    },
    { 
      label: '列表', 
      icon: List,
      children: [
        { label: '无序列表', icon: List, action: 'unordered-list', value: undefined, shortcut: 'Ctrl+U' },
        { label: '有序列表', icon: ListOrdered, action: 'ordered-list', value: undefined, shortcut: 'Ctrl+O' },
        { label: '任务列表', icon: CheckSquare, action: 'task-list', value: undefined, shortcut: 'Ctrl+T' },
      ]
    },
    { type: 'divider' } as const,
    { 
      label: '代码块', 
      icon: FileCode,
      children: [
        { label: 'JavaScript', icon: FileCode, action: 'code-block', value: 'javascript' },
        { label: 'TypeScript', icon: FileCode, action: 'code-block', value: 'typescript' },
        { label: 'Python', icon: FileCode, action: 'code-block', value: 'python' },
        { label: 'Java', icon: FileCode, action: 'code-block', value: 'java' },
        { label: 'C/C++', icon: FileCode, action: 'code-block', value: 'cpp' },
        { label: 'C#', icon: FileCode, action: 'code-block', value: 'csharp' },
        { label: 'Go', icon: FileCode, action: 'code-block', value: 'go' },
        { label: 'Rust', icon: FileCode, action: 'code-block', value: 'rust' },
        { label: 'PHP', icon: FileCode, action: 'code-block', value: 'php' },
        { label: 'Ruby', icon: FileCode, action: 'code-block', value: 'ruby' },
        { label: 'HTML', icon: FileCode, action: 'code-block', value: 'html' },
        { label: 'CSS', icon: FileCode, action: 'code-block', value: 'css' },
        { label: 'SQL', icon: FileCode, action: 'code-block', value: 'sql' },
        { label: 'Shell', icon: FileCode, action: 'code-block', value: 'bash' },
        { label: 'JSON', icon: FileCode, action: 'code-block', value: 'json' },
        { label: 'Markdown', icon: FileCode, action: 'code-block', value: 'markdown' },
        { label: '纯文本', icon: FileCode, action: 'code-block', value: '' },
      ]
    },
    { label: '链接', icon: Link, action: 'link', shortcut: 'Ctrl+K' },
    { label: '图片', icon: ImageIcon, action: 'image', shortcut: 'Ctrl+Shift+I' },
    { label: '引用', icon: Quote, action: 'quote', shortcut: 'Ctrl+Q' },
    { label: '表格', icon: Table, action: 'table', shortcut: 'Ctrl+Shift+T' },
    { label: '分隔线', icon: Minus, action: 'horizontal-rule', shortcut: 'Ctrl+H' },
  ]

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-[180px]"
      style={{ left: position.x, top: position.y, zIndex: 9999 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="max-h-[400px] overflow-y-auto"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#888 transparent'
        }}
      >
        {menuItems.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div 
                key={index} 
                className="h-px bg-gray-200 dark:bg-gray-700 my-2"
              />
            )
          }

          if (item.children) {
            return (
              <div key={index} className="relative">
                <div 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onMouseEnter={() => setOpenSubmenu(index)}
                  onMouseLeave={() => setOpenSubmenu(null)}
                >
                  {item.icon && <item.icon size={16} />}
                  <span className="flex-1">{item.label}</span>
                  <span className="text-gray-400">›</span>
                </div>
                {openSubmenu === index && (
                  <div 
                    className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-[140px]"
                    style={{ 
                      left: position.x + 180, 
                      top: Math.max(10, Math.min(position.y + (index * 36) - 8, window.innerHeight - 200)),
                      zIndex: 10000 
                    }}
                    onMouseEnter={() => setOpenSubmenu(index)}
                    onMouseLeave={() => setOpenSubmenu(null)}
                  >
                    {item.children.map((child, childIndex) => (
                      <button
                        key={childIndex}
                        onClick={() => {
                          onSelect(child.action, child.value !== undefined ? child.value : '')
                          onClose()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {child.icon && <child.icon size={16} />}
                        <span className="flex-1 text-left">{child.label}</span>
                        {child.shortcut && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                            {child.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const Icon = item.icon
          return (
            <button
              key={index}
              onClick={() => {
                onSelect(item.action!)
                onClose()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {Icon && <Icon size={16} />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.shortcut && (
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
