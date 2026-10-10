import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Role, DemoState, SessionState } from '../types';
import { platformStore } from '../services/dataStore';
import { api } from '../services/apiClient';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface PlatformContextType {
  user: User;
  role: Role;
  switchRole: (role: Role) => Promise<void>;
  logout: () => Promise<void>;
  demoState: DemoState;
  refreshDemoState: () => void;
  resetDemo: () => Promise<void>;
  activeSession: SessionState | null;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  isResetting: boolean;
  backendConnected: boolean;
}

const PlatformContext = createContext<PlatformContextType | null>(null);

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('sgsu_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          platformStore.setCurrentUser(parsed);
          return parsed;
        } catch {
          // ignore corrupted storage
        }
      }
    }
    return platformStore.getCurrentUser();
  });
  const [demoState, setDemoState] = useState<DemoState>(() => platformStore.getDemoState());
  const [activeSession, setActiveSession] = useState<SessionState | null>(() => platformStore.getState().activeSession);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);

  // Subscribe to real-time changes in platformStore
  useEffect(() => {
    const unsubscribe = platformStore.subscribe(() => {
      const state = platformStore.getState();
      setUser(platformStore.getCurrentUser());
      setDemoState(platformStore.getDemoState());
      setActiveSession(state.activeSession);
    });
    return unsubscribe;
  }, []);

  // Periodic backend health verification
  useEffect(() => {
    let mounted = true;
    const checkBackend = async () => {
      try {
        const res = await api.checkHealth();
        if (mounted) setBackendConnected(res.status === 'ok');
      } catch {
        if (mounted) setBackendConnected(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const switchRole = useCallback(async (newRole: Role) => {
    try {
      const res = await api.demoLogin(newRole);
      setUser(res.user);
      showToast(`Switched active profile to ${res.user.name} (${newRole})`, 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to switch role', 'error');
    }
  }, [showToast]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
      showToast('Logged out of platform session', 'info');
    } catch (e: any) {
      showToast(e.message || 'Logout encountered an issue', 'error');
    }
  }, [showToast]);

  const refreshDemoState = useCallback(() => {
    setDemoState(platformStore.getDemoState());
  }, []);

  const resetDemo = useCallback(async () => {
    setIsResetting(true);
    try {
      await api.resetDemo();
      refreshDemoState();
      showToast('Demonstration data restored to pristine benchmark state', 'info');
    } catch (e: any) {
      showToast(e.message || 'Failed to reset demonstration', 'error');
    } finally {
      setIsResetting(false);
    }
  }, [refreshDemoState, showToast]);

  return (
    <PlatformContext.Provider
      value={{
        user,
        role: user.role,
        switchRole,
        logout,
        demoState,
        refreshDemoState,
        resetDemo,
        activeSession,
        toasts,
        showToast,
        removeToast,
        isResetting,
        backendConnected
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-sm transition-all duration-200 animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/40 text-amber-200'
                : 'bg-navy-900/95 border-indigo-500/30 text-slate-200'
            }`}
          >
            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors text-xs font-mono px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </PlatformContext.Provider>
  );
};

export const usePlatform = (): PlatformContextType => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
