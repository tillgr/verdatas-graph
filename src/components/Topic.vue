<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core';
import { CustomNode } from 'models';

interface TopicProps extends CustomNode {}

const props = defineProps<TopicProps>();
</script>

<script lang="ts">
export default {
  name: 'Topic',
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="source" :position="Position.Bottom" :is-valid-connection="props.isValidTargetPos" />
  <div>ID: {{ props.label }}</div>
  <div>Type: {{ props.type }}</div>
  <div>Parent: {{ props.data.metaParentType }}</div>
</template>

<style scoped></style>
