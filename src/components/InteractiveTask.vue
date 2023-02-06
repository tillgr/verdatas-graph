<script setup lang="ts">
import { Connection, Handle, Position } from '@vue-flow/core';
import { NodeData, NodeType } from 'models';

interface InteractiveTaskProps {
  isValidTargetPos: (connection: Connection) => boolean;
  isValidSourcePos: (connection: Connection) => boolean;
  id: string;
  type: NodeType;
  label: string;
  data: NodeData;
}

const props = defineProps<InteractiveTaskProps>();
console.log(props);
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
