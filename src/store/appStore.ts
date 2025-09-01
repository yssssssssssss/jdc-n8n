import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark';

interface AppState {
  themeMode: ThemeMode;
  sidebarOpen: boolean;
  loading: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface AppActions {
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export type AppStore = AppState & AppActions;

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // State
      themeMode: 'light',
      sidebarOpen: true,
      loading: false,
      notifications: [],

      // Actions
      setThemeMode: (mode: ThemeMode) => {
        set({ themeMode: mode });
      },

      toggleTheme: () => {
        const currentMode = get().themeMode;
        set({ themeMode: currentMode === 'light' ? 'dark' : 'light' });
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      toggleSidebar: () => {
        set({ sidebarOpen: !get().sidebarOpen });
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };
        set({ notifications: [...get().notifications, newNotification] });
      },

      removeNotification: (id: string) => {
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);