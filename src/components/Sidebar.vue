<script lang="ts" setup>
type NodeData = {
  type: string;
  metaParent: string;
};

const onDragStart = (event: DragEvent, data: NodeData) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', data.type);
    event.dataTransfer.setData('application/vueflow/metaParent', data.metaParent);
    event.dataTransfer.effectAllowed = 'move';
  }
};
const props = defineProps(['nodes']);

console.log(props.nodes);
</script>

<template>
  <aside>
    <div class="description">You can drag these nodes to the pane on the left.</div>
    <div
      v-for="node in props.nodes"
      class="vue-flow__node-{{node.type}}"
      :draggable="true"
      @dragstart="(event: DragEvent) => onDragStart(event, {type: node.type, metaParent: node.metaParent})"
    >
      {{ node.type }}
    </div>
  </aside>
</template>
