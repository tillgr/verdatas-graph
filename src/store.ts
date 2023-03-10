import { defineStore } from 'pinia';

const useStore = defineStore('elementsStore', {
  state() {
    return {
      elements: [[]] as any[],
      history: [] as any[][],
    };
  },
  actions: {
    log() {
      console.log('stored elements', this.elements);
    },
    pushToHistory(data: unknown[]) {
      this.history.push(data);
    },
    clearHistoryAbove(idx: number) {
      const nextIdx = idx + 1;

      nextIdx <= -1 && this.history.splice(nextIdx, -nextIdx);
    },
  },
});

export default useStore;
