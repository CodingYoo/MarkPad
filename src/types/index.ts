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
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  projectId: string | null
  typeId: string | null
  tagIds: string[]
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: 'light' | 'dark'
  autoSave: boolean
  autoSaveInterval: number
}

export interface AppData {
  projects: Project[]
  types: NoteType[]
  tags: Tag[]
  notes: Note[]
  settings: Settings
}

export interface FilterState {
  projectId: string | null
  typeId: string | null
  tagIds: string[]
  searchQuery: string
}
