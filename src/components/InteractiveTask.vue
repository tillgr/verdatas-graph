<script setup>
import { Handle, Position } from '@vue-flow/core';
import { customProps } from './NodeProps.ts';

const props = defineProps(customProps);
console.log(props);
</script>

<script>
export default {
  name: 'InteractiveTask',
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="target" :position="Position.Top" :is-valid-connection="props.isValidSourcePos" />
  <div>ID: {{ props.id }}</div>
  <div>Type: {{ props.type }}</div>
  <div>Parent: {{ props.data.metaParentType }}</div>
</template>

<style scoped></style>
