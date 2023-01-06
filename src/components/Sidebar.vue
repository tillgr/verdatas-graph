<script lang="ts" setup>
import { Node, useVueFlow } from '@vue-flow/core';

const props = defineProps(['nodes']);

const { toObject, nodes, removeNodes, addNodes, addEdges } = useVueFlow();

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

const parseJsonFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e: any) => resolve(JSON.parse(e?.target?.result));
    fr.onerror = (error) => reject(error);
    file && fr.readAsText(file);
  });
};

const handleImport: any = async (e: Event) => {
  // TODO
  const file = (<HTMLInputElement>e?.target).files?.[0];
  if (!file) return;

  return await parseJsonFile(file);
};

const handleGraphImport = async (e: Event) => {
  const result = handleImport(e);

  removeNodes(nodes.value, true);
  addNodes(result.nodes);
  addEdges(result.edges);
};

const handleIliasImport = async (e: Event) => {
  const result = handleImport(e);

  const modules = result?.modules.map((module: any) => {
    const chapters = module.chapters.map((chapter: any) => {
      const interactiveTasks = chapter.interactiveTasks?.map((task: any) => {
        return { id: task.object_id };
      });
      return { id: chapter.object_id, interactiveTasks: interactiveTasks };
    });
    return { id: module.object_id, chapters: chapters };
  });
  const output = {
    topic: { id: result.object_id, modules: modules },
  };

  console.log(output);
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
    <button class="export-button" @click="handleExport">Export graph</button>
    <div class="file-input">
      <label for="graph-input">Import graph</label>
      <input type="file" id="selectFiles" accept=".json" name="graph-input" @change="(e) => handleGraphImport(e)" />
    </div>
    <div class="file-input">
      <label for="ilias-input">Import from ilias</label>
      <input type="file" id="selectFiles" accept=".json" name="ilias-input" @change="(e) => handleIliasImport(e)" />
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
