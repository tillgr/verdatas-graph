<script setup lang="ts">
import { Connection, Handle, Position } from '@vue-flow/core';
import { NodeData, NodeType } from 'models';

interface ChapterProps {
  //Prop interface cannot be extended in vue 3
  //https://vuejs.org/guide/typescript/composition-api.html#typing-component-props
  //https://github.com/vuejs/core/issues/4294
  isValidTargetPos: (connection: Connection) => boolean;
  isValidSourcePos: (connection: Connection) => boolean;
  id: string;
  type: NodeType;
  label: string;
  data: NodeData;
}

const props = defineProps<ChapterProps>();
</script>

<script lang="ts">
export default {
  name: 'Chapter',
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="target" :position="Position.Top" :is-valid-connection="props.isValidSourcePos" />
  <Handle type="source" :position="Position.Bottom" :is-valid-connection="props.isValidTargetPos" />
  <div>ID: {{ props.label }}</div>
  <div>Type: {{ props.type }}</div>
  <div>Parent: {{ props.data.metaParentType }}</div>
</template>

<style scoped></style>
