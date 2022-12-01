<script setup lang="ts">
import { Connection, ConnectionMode, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';

import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';

const { addEdges, nodes } = useVueFlow({
  nodes: [
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
  ],
});

const checkType = (id: string, type: string): boolean => {
  const node = nodes.value.filter((el) => {
    return el.id === id;
  })[0];
  return node?.type === type;
};

const onLoad = (flowInstance: VueFlowStore) => flowInstance.fitView();
const onConnectStart = ({ nodeId, handleType }: { [key: string]: string }) =>
  console.log('on connect start', { nodeId, handleType });
const onConnectEnd = (event: Event) => console.log('on connect end', event);
const onConnect = (params: Connection) => {
  console.log('on connect', params);
  addEdges([params]);
};
</script>

<template>
  <VueFlow
    fit-view-on-init
    class="validationflow"
    @connect="onConnect"
    @pane-ready="onLoad"
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
