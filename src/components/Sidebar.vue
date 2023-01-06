<script lang="ts" setup>
import { Node, useVueFlow } from '@vue-flow/core';
import { ImportResult } from 'models';

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

const handleImport = (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  const fr = new FileReader();
  let result: ImportResult;

  fr.onload = (e) => {
    if (typeof e.target?.result === 'string') {
      result = JSON.parse(e.target.result);
      // console.log(JSON.stringify(result, null, 2));
      removeNodes(nodes.value, true);
      addNodes(result.nodes);
      addEdges(result.edges);

      // TODO extract method
      // TODO add function for adding validation functions in post
    }
  };
  file && fr.readAsText(file);
};

const handleIliasImport = (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  const fr = new FileReader();
  let result: any; // TODO

  fr.onload = (e) => {
    if (typeof e.target?.result === 'string') {
      result = JSON.parse(e.target.result);

      const modules = result.modules.map((module: any) => {
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
    <button class="export-button" @click="handleExport">Export graph</button>
    <div class="file-input">
      <label for="graph-input">Import graph</label>
      <input type="file" id="selectFiles" accept=".json" name="graph-input" @change="(e) => handleImport(e)" />
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
