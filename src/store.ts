import { defineStore } from 'pinia';

let historyPosition = 0;

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
    undo() {
      console.log('last item', this.history.at(-1));
      this.elements = this.history.at(-2 - historyPosition) || [];
      historyPosition++;
      console.log('elements', this.elements);
    },
  },
});

export default useStore;
