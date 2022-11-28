<script setup>
import { addEdge, ConnectionMode, VueFlow } from '@vue-flow/core';
import { ref } from 'vue';

import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';

const elements = ref([
  {
    id: 'module',
    type: 'module',
    position: { x: 250, y: 0 },
    isValidSourcePos: (connection) => connection.source === 'topic',
    isValidTargetPos: () => false,
  },
  {
    id: 'topic',
    type: 'topic',
    position: { x: 250, y: 150 },
    //Called when source handle is used for connection
    isValidSourcePos: (connection) => connection.source === 'chapter',
    //Called when target handle is used for connection
    isValidTargetPos: (connection) => connection.target === 'module',
  },
  {
    id: 'chapter',
    type: 'chapter',
    position: { x: 250, y: 300 },
    isValidSourcePos: (connection) => connection.source === 'interactivetask',
    isValidTargetPos: (connection) => connection.target === 'topic',
  },
  {
    id: 'interactive_task',
    type: 'interactivetask',
    position: { x: 250, y: 450 },
    isValidSourcePos: () => false,
    isValidTargetPos: (connection) => connection.target === 'chapter',
  },
]);

const onConnectStart = ({ nodeId, handleType }) => console.log('on connect start', { nodeId, handleType });

const onConnectEnd = (event) => console.log('on connect end', event);

const onConnect = (params) => {
  console.log('on connect', params);
  addEdge(params, elements.value);
};
</script>

<template>
  <VueFlow
    v-model="elements"
    fit-view-on-init
    class="validationflow"
    @connect="onConnect"
    @connect-start="onConnectStart"
    @connect-end="onConnectEnd"
    :connection-mode="ConnectionMode.Strict"
  >
    <template #node-module="props">
      <Module v-bind="props" />
    </template>
    <template #node-chapter="props">
      <Chapter v-bind="props" />
    </template>
    <template #node-topic="props">
      <Topic v-bind="props" />
    </template>
    <template #node-interactivetask="props">
      <InteractiveTask v-bind="props" />
    </template>
  </VueFlow>
</template>
