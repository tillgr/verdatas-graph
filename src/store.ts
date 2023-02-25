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
    cleanHistoryAbove(idx: number) {
      console.log('b_c', this.history);
      const nextIdx = idx + 1;

      nextIdx <= -1 && this.history.splice(nextIdx, -nextIdx);
      // [-3,-2,-1]
      console.log('a_c', this.history);
    },
  },
});

export default useStore;
