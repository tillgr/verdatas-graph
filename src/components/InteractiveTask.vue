<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { CustomNode } from 'models';

interface InteractiveTaskProps extends CustomNode {}

const props = defineProps<InteractiveTaskProps>();
</script>

<script lang="ts">
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
