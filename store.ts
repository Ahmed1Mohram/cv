import { create } from 'zustand';

interface AppState {
  currentSection: number;
  setSection: (section: number) => void;
  loaded: boolean;
  setLoaded: (loaded: boolean) => void;
  expandedProject: number | null;
  setExpandedProject: (id: number | null) => void;
  projects: ProjectData[];
  setProjects: (projects: ProjectData[]) => void;
}

export interface ProjectData {
  id: number;
  title: string;
  subtitle: string;
  desc: string;
  details?: string | null;
  stack: string[];
  liveUrl: string;
  githubUrl?: string | null;
  imageUrl?: string | null;
  sortOrder?: number | null;
}

export const useStore = create<AppState>((set) => ({
  currentSection: 0,
  setSection: (section) => set({ currentSection: section }),
  loaded: false,
  setLoaded: (loaded) => set({ loaded }),
  expandedProject: null,
  setExpandedProject: (id) => set({ expandedProject: id }),
  projects: [],
  setProjects: (projects) => set({ projects }),
}));

// Constants for configuration
export const TOTAL_SECTIONS = 5;
export const SECTIONS = {
  INTRO: 0,
  PROJECTS: 1,
  SKILLS: 2,
  ABOUT: 3,
  CONTACT: 4
};