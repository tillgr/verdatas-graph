<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { customNodeProps } from './CustomNodeProps';

const props = defineProps<customNodeProps>();
</script>

<script>
export default {
  name: 'InteractiveTask',
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="target" :position="Position.Top" :is-valid-connection="props.isValidSourcePos" />
  <div>ID: {{ props.label }}</div>
  <div>Type: {{ props.type }}</div>
  <div>Parent: {{ props.data.metaParentType }}</div>
</template>

<style scoped></style>
