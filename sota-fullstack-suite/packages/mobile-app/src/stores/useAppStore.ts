import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

interface AppState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
}

interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
}

interface AppActions {
  initializeApp: () => Promise<void>;
  login: (user: User) => void;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotifications: (enabled: boolean) => void;
}

// Custom secure storage adapter for React Native
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Handle error silently
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Handle error silently
    }
  },
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      // Initial state
      isInitialized: false,
      isAuthenticated: false,
      user: null,
      theme: 'system',
      notifications: true,

      // Actions
      initializeApp: async () => {
        // Simulate initialization (check auth, load user data, etc.)
        await new Promise((resolve) => setTimeout(resolve, 1000));
        set({ isInitialized: true });
      },

      login: (user) => {
        set({ isAuthenticated: true, user });
      },

      logout: () => {
        set({ isAuthenticated: false, user: null });
      },

      setTheme: (theme) => {
        set({ theme });
      },

      setNotifications: (enabled) => {
        set({ notifications: enabled });
      },
    }),
    {
      name: 'sota-app-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({
        theme: state.theme,
        notifications: state.notifications,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
