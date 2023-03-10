<script lang="ts" setup>
import { useVueFlow } from '@vue-flow/core';
import { NodeType, VueFlowGraph } from 'models';
import { IliasGraph } from 'models/IliasGraph';
import { filterJsonFile, parseJsonFile } from 'utils/import';
import { calculateTreeLayout } from 'utils/graph';

const { toObject, nodes, edges, removeNodes, addNodes, addEdges } = useVueFlow();

const onDragStart = (event: DragEvent, type: NodeType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', type || '');
    event.dataTransfer.effectAllowed = 'move';
  }
};
const handleExport = () => {
  const data = JSON.stringify(toObject());
  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');

  a.download = 'verdatas-graph-export.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  a.click();
  window.URL.revokeObjectURL(a.href);
};

const handleImport = async (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  if (!file) return;

  return await parseJsonFile(file);
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

  const filtered = filterJsonFile(file);
  const { nodes: newNodes, edges: newEdges } = calculateTreeLayout(filtered, nodes, edges);

  removeNodes(nodes.value, true);
  addNodes(newNodes);
  addEdges(newEdges);
};
</script>

<template>
  <aside>
    <div class="node-section">
      <div class="description">You can drag these nodes to the pane on the left.</div>
      <div
        v-for="type of NodeType"
        class="node-templates"
        :class="'vue-flow__node-' + type"
        :draggable="true"
        @dragstart="(event: DragEvent) => onDragStart(event, type)"
      >
        {{ type }}
      </div>
    </div>
    <div class="export-section">
      <button class="export-button" @click="handleExport">Export graph</button>
      <div class="file-input">
        <label for="graph-input">Import graph</label>
        <input type="file" id="selectFiles" accept=".json" name="graph-input" @change="(e) => importGraph(e)" />
      </div>
      <div class="file-input">
        <label for="ilias-input">Import from ilias</label>
        <input type="file" id="selectFiles" accept=".json" name="ilias-input" @change="(e) => importIlias(e)" />
      </div>
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

.node-section,
.export-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 767px) {
  aside {
    flex-direction: row;
    justify-content: space-between;
  }

  .export-section {
    justify-content: flex-end;
  }
}

.export-button {
  margin-right: auto;
  margin-top: 2rem;
  display: block;
}

.description {
  text-align: left;
}
</style>
