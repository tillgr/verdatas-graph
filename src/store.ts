import { defineStore } from 'pinia';

const useStore = defineStore('elementsStore', {
  state() {
    return {
      elements: [] as unknown[],
      history: [] as unknown[][],
    };
  },
  actions: {
    log() {
      console.log('stored elements', this.elements);
    },
    pushToHistory(data: unknown[]) {
      this.history.push(data);
    },
  },
});

export default useStore;
