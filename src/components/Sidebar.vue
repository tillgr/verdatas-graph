<script lang="ts" setup>
import { Node } from '@vue-flow/core';

const onDragStart = (event: DragEvent, node: Node) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', node.type || '');
    event.dataTransfer.setData('application/vueflow/metaParentType', node.data.metaParentType);
    event.dataTransfer.setData('application/vueflow/metaChildType', node.data.metaChildType);
    event.dataTransfer.effectAllowed = 'move';
  }
};
const props = defineProps(['nodes']);
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
  </aside>
</template>

<style scoped>
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
