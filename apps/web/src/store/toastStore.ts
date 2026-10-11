import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  durationMs?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (item) => {
    toastIdCounter += 1;
    const id = `toast-${toastIdCounter}-${Date.now()}`;
    const newToast: ToastItem = { ...item, id };

    set((state) => ({
      toasts: [...state.toasts.slice(-2), newToast],
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (message: string, title?: string, durationMs = 3200) =>
    useToastStore.getState().addToast({ type: 'success', message, title, durationMs }),
  error: (message: string, title?: string, durationMs = 4000) =>
    useToastStore.getState().addToast({ type: 'error', message, title, durationMs }),
  warning: (message: string, title?: string, durationMs = 3500) =>
    useToastStore.getState().addToast({ type: 'warning', message, title, durationMs }),
  info: (message: string, title?: string, durationMs = 3000) =>
    useToastStore.getState().addToast({ type: 'info', message, title, durationMs }),
  dismiss: (id: string) => useToastStore.getState().dismissToast(id),
  clear: () => useToastStore.getState().clearToasts(),
};
