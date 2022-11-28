<script setup>
import { Handle, Position } from '@vue-flow/core';

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  isValidSourcePos: {
    type: Function,
    required: false,
  },
  isValidTargetPos: {
    type: Function,
    required: false,
  },
});
</script>

<script>
export default {
  inheritAttrs: false,
};
</script>

<template>
  <Handle type="target" :position="Position.Left" :is-valid-connection="props.isValidSourcePos" />
  <Handle type="source" :position="Position.Right" :is-valid-connection="props.isValidTargetPos" />
  <div>{{ props.id }}</div>
</template>
