<script setup>
import { Handle, Position } from '@vue-flow/core';
import { customProps } from './NodeProps.ts';

const props = defineProps(customProps);
</script>

<script>
export default {
  name: 'Chapter',
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="target" :position="Position.Left" :is-valid-connection="props.isValidSourcePos" />
  <Handle type="source" :position="Position.Right" :is-valid-connection="props.isValidTargetPos" />
  <div>ID: {{ props.id }}</div>
  <div>Type: {{ props.type }}</div>
  <div>Parent: {{ props.metaParent }}</div>
</template>

<style scoped></style>
