import { create } from 'zustand';

const useExamStore = create((set) => ({
  draftAnswers: {},
  setDraftAnswer: (examId, questionId, option) => set((state) => ({
    draftAnswers: {
      ...state.draftAnswers,
      [examId]: {
        ...(state.draftAnswers[examId] || {}),
        [questionId]: option,
      },
    },
  })),
  clearDraft: (examId) => set((state) => {
    const next = { ...state.draftAnswers };
    delete next[examId];
    return { draftAnswers: next };
  }),
}));

export default useExamStore;
