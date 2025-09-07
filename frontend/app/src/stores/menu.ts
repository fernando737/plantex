import { create } from 'zustand';

interface MenuStore {
  options: Record<string, unknown>;
  addOptions: (newOptions: Record<string, unknown>) => void;
  resetForm: () => void;
}

const useMenuStore = create<MenuStore>(set => ({
  options: {},
  addOptions: (newOptions: Record<string, unknown>) =>
    set(state => ({
      options: { ...state.options, ...newOptions },
    })),
  resetForm: () => set({ options: {} }),
}));

export default useMenuStore;
