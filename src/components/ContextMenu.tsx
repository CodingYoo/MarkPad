import { useEffect, useState } from 'react'
import { 
  Heading1, Heading2, Heading3, 
  Bold, Italic, Code, Link,
  List, ListOrdered, CheckSquare,
  Table, Image as ImageIcon, Quote,
  Minus, FileCode
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
        { label: 'H1', icon: Heading1, action: 'heading', value: '1' },
        { label: 'H2', icon: Heading2, action: 'heading', value: '2' },
        { label: 'H3', icon: Heading3, action: 'heading', value: '3' },
      ]
    },
    { type: 'divider' },
    { 
      label: '格式', 
      icon: Bold,
      children: [
        { label: '粗体', icon: Bold, action: 'bold' },
        { label: '斜体', icon: Italic, action: 'italic' },
        { label: '删除线', icon: Minus, action: 'strikethrough' },
        { label: '行内代码', icon: Code, action: 'inline-code' },
      ]
    },
    { 
      label: '列表', 
      icon: List,
      children: [
        { label: '无序列表', icon: List, action: 'unordered-list' },
        { label: '有序列表', icon: ListOrdered, action: 'ordered-list' },
        { label: '任务列表', icon: CheckSquare, action: 'task-list' },
      ]
    },
    { type: 'divider' },
    { label: '链接', icon: Link, action: 'link' },
    { label: '图片', icon: ImageIcon, action: 'image' },
    { label: '引用', icon: Quote, action: 'quote' },
    { label: '代码块', icon: FileCode, action: 'code-block' },
    { label: '表格', icon: Table, action: 'table' },
    { label: '分隔线', icon: Minus, action: 'horizontal-rule' },
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
                          onSelect(child.action, child.value)
                          onClose()
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {child.icon && <child.icon size={16} />}
                        <span>{child.label}</span>
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
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
