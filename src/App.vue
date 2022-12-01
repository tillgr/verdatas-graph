<script setup lang="ts">
import { Connection, ConnectionMode, Node, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';

import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { ref } from 'vue';

let id = 0;
const getId = () => `dndnode_${id++}`;

const initNodes = ref([
  {
    id: 'module',
    type: 'module',
    position: { x: 250, y: 0 },
    metaParent: '',
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'topic'),
    isValidTargetPos: () => false,
  },
  {
    id: 'topic',
    type: 'topic',
    position: { x: 250, y: 150 },
    metaParent: 'module',
    //Called when source handle is used for connection
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'chapter'),
    //Called when target handle is used for connection
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'module'),
  },
  {
    id: 'chapter',
    type: 'chapter',
    position: { x: 250, y: 300 },
    metaParent: 'topic',
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'interactivetask'),
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'topic'),
  },
  {
    id: 'interactive_task',
    type: 'interactivetask',
    position: { x: 250, y: 450 },
    metaParent: 'chapter',
    isValidSourcePos: () => false,
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'chapter'),
  },
]);

const { addEdges, nodes, onConnect, addNodes, project } = useVueFlow();

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};
const wrapper = ref();

const checkType = (id: string, type?: string): boolean => {
  const node = nodes.value.filter((el) => {
    return el.id === id;
  })[0];
  return node?.type === type;
};

const onLoad = (flowInstance: VueFlowStore) => flowInstance.fitView();
const onConnectStart = ({ nodeId, handleType }: { [key: string]: string }) =>
  console.log('on connect start', { nodeId, handleType });
const onConnectEnd = (event: Event) => console.log('on connect end', event);
onConnect((params: Connection) => {
  console.log('on connect', params);
  addEdges([params]);
});
onConnect((params) => addEdges([params]));
const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow/type');
  const metaParent = event.dataTransfer?.getData('application/vueflow/metaParent');
  console.log(metaParent);

  const flowbounds = wrapper.value.$el.getBoundingClientRect();
  const position = project({
    x: event.clientX - flowbounds.left,
    y: event.clientY - flowbounds.top,
  });
  const newNode = {
    id: getId(),
    type,
    position,
    label: `${type} node`,
    metaParent,
    isValidSourcePos: (connection: Connection) => checkType(connection.source, type),
    isValidTargetPos: (connection: Connection) => checkType(connection.target, metaParent),
  } as Node;
  addNodes([newNode]);
};
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <VueFlow
      fit-view-on-init
      class="validationflow"
      ref="wrapper"
      @dragover="onDragOver"
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
    <Sidebar :nodes="initNodes" />
  </div>
</template>
