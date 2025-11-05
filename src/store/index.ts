import { create } from 'zustand'
import { AppData, Note, Project, NoteType, Tag, Folder, FilterState } from '../types'
import { generateId, getInitialData } from '../utils'

interface AppStore extends AppData {
  currentNoteId: string | null
  filter: FilterState
  
  // Note operations
  createNote: (note: Partial<Note>) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setCurrentNote: (id: string | null) => void
  togglePinNote: (id: string) => void
  
  // Project operations
  createProject: (name: string, color: string) => void
  updateProject: (id: string, name: string, color: string) => void
  deleteProject: (id: string) => void
  
  // Type operations
  createType: (name: string, icon: string) => void
  updateType: (id: string, name: string, icon: string) => void
  deleteType: (id: string) => void
  
  // Tag operations
  createTag: (name: string, group?: string) => void
  updateTag: (id: string, name: string, group?: string) => void
  deleteTag: (id: string) => void
  
  // Folder operations
  createFolder: (name: string, projectId: string | null, typeId: string | null) => void
  updateFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  
  // Filter operations
  setFilter: (filter: Partial<FilterState>) => void
  resetFilter: () => void
  
  // Settings
  toggleTheme: () => void
  updateSettings: (settings: Partial<AppData['settings']>) => void
  
  // Data operations
  loadData: (data: AppData) => void
  exportData: () => AppData
  resetData: () => void
}

export const useStore = create<AppStore>((set, get) => ({
  ...getInitialData(),
  currentNoteId: null,
  filter: {
    projectId: null,
    typeId: null,
    tagIds: [],
    searchQuery: '',
  },
  
  // Note operations
  createNote: (note) => {
    const now = new Date().toISOString()
    const newNote: Note = {
      id: generateId(),
      title: note.title || '无标题',
      content: note.content || '',
      projectId: note.projectId || null,
      typeId: note.typeId || null,
      tagIds: note.tagIds || [],
      folderId: note.folderId || null,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      notes: [newNote, ...state.notes],
      currentNoteId: newNote.id,
    }))
  },
  
  updateNote: (id, updates) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updatedAt: new Date().toISOString() }
          : note
      ),
    }))
  },
  
  deleteNote: (id) => {
    set((state) => ({
      notes: state.notes.filter((note) => note.id !== id),
      currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
    }))
  },
  
  setCurrentNote: (id) => {
    set({ currentNoteId: id })
  },
  
  togglePinNote: (id) => {
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, isPinned: !note.isPinned } : note
      ),
    }))
  },
  
  // Project operations
  createProject: (name, color) => {
    const newProject: Project = {
      id: generateId(),
      name,
      color,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      projects: [...state.projects, newProject],
    }))
  },
  
  updateProject: (id, name, color) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, name, color } : project
      ),
    }))
  },
  
  deleteProject: (id) => {
    set((state) => ({
      projects: state.projects.filter((project) => project.id !== id),
      notes: state.notes.map((note) =>
        note.projectId === id ? { ...note, projectId: null } : note
      ),
    }))
  },
  
  // Type operations
  createType: (name, icon) => {
    const newType: NoteType = {
      id: generateId(),
      name,
      icon,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      types: [...state.types, newType],
    }))
  },
  
  updateType: (id, name, icon) => {
    set((state) => ({
      types: state.types.map((type) =>
        type.id === id ? { ...type, name, icon } : type
      ),
    }))
  },
  
  deleteType: (id) => {
    set((state) => ({
      types: state.types.filter((type) => type.id !== id),
      notes: state.notes.map((note) =>
        note.typeId === id ? { ...note, typeId: null } : note
      ),
    }))
  },
  
  // Tag operations
  createTag: (name, group) => {
    const newTag: Tag = {
      id: generateId(),
      name,
      group,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      tags: [...state.tags, newTag],
    }))
  },
  
  updateTag: (id, name, group) => {
    set((state) => ({
      tags: state.tags.map((tag) =>
        tag.id === id ? { ...tag, name, group } : tag
      ),
    }))
  },
  
  deleteTag: (id) => {
    set((state) => ({
      tags: state.tags.filter((tag) => tag.id !== id),
      notes: state.notes.map((note) => ({
        ...note,
        tagIds: note.tagIds.filter((tagId) => tagId !== id),
      })),
    }))
  },
  
  // Folder operations
  createFolder: (name, projectId, typeId) => {
    const newFolder: Folder = {
      id: generateId(),
      name,
      projectId,
      typeId,
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      folders: [...state.folders, newFolder],
    }))
  },
  
  updateFolder: (id, name) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, name } : folder
      ),
    }))
  },
  
  deleteFolder: (id) => {
    set((state) => ({
      folders: state.folders.filter((folder) => folder.id !== id),
      notes: state.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: null } : note
      ),
    }))
  },
  
  // Filter operations
  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },
  
  resetFilter: () => {
    set({
      filter: {
        projectId: null,
        typeId: null,
        tagIds: [],
        searchQuery: '',
      },
    })
  },
  
  // Settings
  toggleTheme: () => {
    set((state) => ({
      settings: {
        ...state.settings,
        theme: state.settings.theme === 'light' ? 'dark' : 'light',
      },
    }))
  },
  
  updateSettings: (settings) => {
    set((state) => ({
      settings: { ...state.settings, ...settings },
    }))
  },
  
  // Data operations
  loadData: (data) => {
    // Migrate folders: add projectId and typeId if missing
    const migratedFolders = data.folders.map(folder => ({
      ...folder,
      projectId: folder.projectId ?? null,
      typeId: folder.typeId ?? null
    }))
    
    set({
      ...data,
      folders: migratedFolders
    })
  },
  
  exportData: () => {
    const state = get()
    return {
      projects: state.projects,
      types: state.types,
      tags: state.tags,
      folders: state.folders,
      notes: state.notes,
      settings: state.settings,
    }
  },
  
  resetData: () => {
    set({
      ...getInitialData(),
      currentNoteId: null,
      filter: {
        projectId: null,
        typeId: null,
        tagIds: [],
        searchQuery: '',
      },
    })
  },
}))
