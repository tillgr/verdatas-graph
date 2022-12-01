<script lang="ts" setup>
const onDragStart = (event: DragEvent, nodeType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow', nodeType);
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
      @dragstart="(event: DragEvent) => onDragStart(event, node.type)"
    >
      {{ node.type }}
    </div>
  </aside>
</template>
