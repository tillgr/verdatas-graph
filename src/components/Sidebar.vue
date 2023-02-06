<script lang="ts" setup>
import { Node, useVueFlow } from '@vue-flow/core';
import { NodeType, VueFlowGraph } from 'models';
import { graphUtils, importUtils } from 'utils';
import { IliasGraph } from 'models/IliasGraph';

const { toObject, nodes, edges, removeNodes, addNodes, addEdges } = useVueFlow();

const onDragStart = (event: DragEvent, node: Node) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', node.type || '');
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

const handleImport = async (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  if (!file) return;

  return await importUtils.parseJsonFile(file);
};

const importGraph = async (e: Event) => {
  const file = <VueFlowGraph | undefined>await handleImport(e);
  if (!file) return;

  removeNodes(nodes.value, true);
  addNodes(file.nodes);
  addEdges(file.edges);
};

const importIlias = async (e: Event) => {
  const file = <IliasGraph | undefined>await handleImport(e);
  if (!file) return;

  const filtered = importUtils.filterJsonFile(file);
  const { nodes: newNodes, edges: newEdges } = graphUtils.calculateTreeLayout(filtered, nodes, edges);

  removeNodes(nodes.value, true);
  addNodes(newNodes);
  addEdges(newEdges);
};
</script>

<template>
  <aside>
    <div class="description">You can drag these nodes to the pane on the left.</div>
    <div
      v-for="type of NodeType"
      class="node-templates"
      :class="'vue-flow__node-' + type"
      :draggable="true"
      @dragstart="(event: DragEvent) => onDragStart(event, node)"
    >
      {{ type }}
    </div>
    <button class="export-button" @click="handleExport">Export graph</button>
    <div class="file-input">
      <label for="graph-input">Import graph</label>
      <input type="file" id="selectFiles" accept=".json" name="graph-input" @change="(e) => importGraph(e)" />
    </div>
    <div class="file-input">
      <label for="ilias-input">Import from ilias</label>
      <input type="file" id="selectFiles" accept=".json" name="ilias-input" @change="(e) => importIlias(e)" />
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

aside {
  min-width: 260px;
}

.export-button {
  margin-right: auto;
  margin-top: 2rem;
  display: block;
}
</style>
