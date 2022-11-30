<script setup lang="ts">
import { addEdge, Connection, ConnectionMode, VueFlow } from '@vue-flow/core';
import { ref } from 'vue';

import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import ConnectionLine from './components/SnappableConnectionLine.vue';

const elements = ref([
  {
    id: 'module',
    type: 'module',
    position: { x: 250, y: 0 },
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'topic'),
    isValidTargetPos: () => false,
  },
  {
    id: 'topic',
    type: 'topic',
    position: { x: 250, y: 150 },
    //Called when source handle is used for connection
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'chapter'),
    //Called when target handle is used for connection
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'module'),
  },
  {
    id: 'chapter',
    type: 'chapter',
    position: { x: 250, y: 300 },
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'interactivetask'),
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'topic'),
  },
  {
    id: 'interactive_task',
    type: 'interactivetask',
    position: { x: 250, y: 450 },
    isValidSourcePos: () => false,
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'chapter'),
  },
]);

const checkType = (id: string, type: string): boolean => {
  const node = elements.value.filter((el) => {
    return el.id === id;
  })[0];
  return node?.type === type;
};

const onConnectStart = ({ nodeId, handleType }: { [key: string]: string }) =>
  console.log('on connect start', { nodeId, handleType });

const onConnectEnd = (event: Event) => console.log('on connect end', event);

const onConnect = (params: any) => {
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

    <template #connection-line="{ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }">
      <ConnectionLine
        :source-x="sourceX"
        :source-y="sourceY"
        :target-x="targetX"
        :target-y="targetY"
        :source-position="sourcePosition"
        :target-position="targetPosition"
      />
    </template>
  </VueFlow>
</template>
