export interface Project {
  id: string
  name: string
  color: string
  createdAt: string
}

export interface NoteType {
  id: string
  name: string
  icon: string
  createdAt: string
}

export interface Tag {
  id: string
  name: string
  group?: string  // 标签组名称，同组标签互斥（只能选一个）
  createdAt: string
}

export interface Folder {
  id: string
  name: string
  projectId: string | null
  typeId: string | null
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  projectId: string | null
  typeId: string | null
  tagIds: string[]
  folderId: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export type CodeTheme = 
  | 'oneDark'
  | 'oneLight'
  | 'github'
  | 'githubDark'
  | 'vscDark'
  | 'dracula'
  | 'nightOwl'
  | 'nord'
  | 'atomDark'
  | 'materialDark'

export interface Settings {
  theme: 'light' | 'dark'
  codeTheme: CodeTheme
  autoSave: boolean
  autoSaveInterval: number
}

export interface AppData {
  projects: Project[]
  types: NoteType[]
  tags: Tag[]
  folders: Folder[]
  notes: Note[]
  settings: Settings
}

export interface FilterState {
  projectId: string | null
  typeId: string | null
  tagIds: string[]
  searchQuery: string
}
