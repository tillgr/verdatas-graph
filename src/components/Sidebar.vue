<script lang="ts" setup>
import { Node, useVueFlow } from '@vue-flow/core';

const props = defineProps(['nodes']);

const { toObject } = useVueFlow();

const onDragStart = (event: DragEvent, node: Node) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', node.type || '');
    event.dataTransfer.setData('application/vueflow/metaParentType', node.data.metaParentType);
    event.dataTransfer.setData('application/vueflow/metaChildType', node.data.metaChildType);
    event.dataTransfer.effectAllowed = 'move';
  }
};
const handleExport = () => {
  const data = JSON.stringify(toObject());
  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');

  a.download = 'test.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  a.click();
  window.URL.revokeObjectURL(a.href);
};

const handleImport = (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  console.log();

  const fr = new FileReader();

  fr.onload = (e) => {
    if (typeof e.target?.result === 'string') {
      const result = JSON.parse(e.target.result);
      console.log(JSON.stringify(result, null, 2));
    }
  };
  file && fr.readAsText(file);
};
</script>

<template>
  <aside>
    <div class="description">You can drag these nodes to the pane on the left.</div>
    <div
      v-for="node in props.nodes"
      class="node-templates"
      :class="'vue-flow__node-' + node.type"
      :draggable="true"
      @dragstart="(event: DragEvent) => onDragStart(event, node)"
    >
      {{ node.type }}
    </div>
    <button @click="handleExport">Export graph</button>
    <div class="file-input">
      <label for="file-input">Import JSON</label>
      <input type="file" id="selectFiles" accept=".json" name="file-input" @change="(e) => handleImport(e)" />
    </div>
  </aside>
</template>

<style scoped>
.file-input {
  display: flex;
  flex-direction: column;
}

.file-input * {
  width: fit-content;
}

.node-templates {
  width: 150px;
  border-radius: 5px;
  padding: 10px;
  color: #555;
  text-align: center;
  font-size: 12px;
  background-color: white;
}
</style>
