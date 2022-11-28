<script setup>
import { Handle, Position } from '@vue-flow/core';
import { customProps } from './NodeProps.ts';

const props = defineProps(customProps);
</script>

<script>
export default {
  name: 'InteractiveTask',
};
</script>

<template>
  <Handle type="target" :position="Position.Left" :is-valid-connection="props.isValidSourcePos" />
  <Handle type="source" :position="Position.Right" :is-valid-connection="props.isValidTargetPos" />
  <div>{{ props.id }}</div>
</template>

<style scoped></style>
