import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
}

interface AppState {
  user: User | null;
  likesCount: number;
  setUser: (user: User | null) => void;
  incrementLikes: () => void;
  resetLikes: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: {
    id: '1',
    username: 'insta_creator',
    name: 'Instagram Creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  likesCount: 124,
  setUser: (user) => set({ user }),
  incrementLikes: () => set((state) => ({ likesCount: state.likesCount + 1 })),
  resetLikes: () => set({ likesCount: 0 }),
}));
