export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) {
      const minutes = Math.floor(diff / (1000 * 60))
      return minutes === 0 ? '刚刚' : `${minutes}分钟前`
    }
    return `${hours}小时前`
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}

export const getInitialData = () => {
  const now = new Date().toISOString()
  
  return {
    projects: [
      { id: generateId(), name: '个人项目', color: '#3B82F6', createdAt: now },
      { id: generateId(), name: '工作事项', color: '#10B981', createdAt: now },
    ],
    types: [
      { id: generateId(), name: '待办', icon: 'CheckSquare', createdAt: now },
      { id: generateId(), name: '笔记', icon: 'FileText', createdAt: now },
      { id: generateId(), name: '想法', icon: 'Lightbulb', createdAt: now },
      { id: generateId(), name: '会议', icon: 'Users', createdAt: now },
    ],
    tags: [
      { id: generateId(), name: '紧急', createdAt: now },
      { id: generateId(), name: '重要', createdAt: now },
    ],
    notes: [],
    settings: {
      theme: 'light' as const,
      autoSave: true,
      autoSaveInterval: 3000,
    }
  }
}
