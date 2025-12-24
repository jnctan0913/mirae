import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserProgress {
  stage0Complete: boolean;
  stage1Complete: boolean;
  stage2Complete: boolean;
  stage3Complete: boolean;
  stage4Complete: boolean;
  stage5Complete: boolean;
  currentStage: number;
}

interface UserStore {
  userId: string | null;
  progress: UserProgress;
  setUserId: (id: string) => void;
  completeStage: (stage: number) => void;
  setCurrentStage: (stage: number) => void;
  reset: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      userId: null,
      progress: {
        stage0Complete: false,
        stage1Complete: false,
        stage2Complete: false,
        stage3Complete: false,
        stage4Complete: false,
        stage5Complete: false,
        currentStage: 0,
      },

      setUserId: (id) => set({ userId: id }),

      completeStage: (stage) =>
        set((state) => ({
          progress: {
            ...state.progress,
            [`stage${stage}Complete`]: true as any,
            currentStage: Math.max(state.progress.currentStage, stage + 1),
          },
        })),

      setCurrentStage: (stage) =>
        set((state) => ({
          progress: { ...state.progress, currentStage: stage },
        })),

      reset: () =>
        set(() => ({
          userId: null,
          progress: {
            stage0Complete: false,
            stage1Complete: false,
            stage2Complete: false,
            stage3Complete: false,
            stage4Complete: false,
            stage5Complete: false,
            currentStage: 0,
          },
        })),
    }),
    { name: 'scope-user' }
  )
);
