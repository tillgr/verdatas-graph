<script setup lang="ts">
import { Connection, ConnectionMode, Node, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';
import { Background, Controls, MiniMap } from '@vue-flow/additional-components';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { ref } from 'vue';

const initNodes = ref([
  {
    id: 'module',
    type: 'module',
    position: { x: 250, y: 0 },
    data: {
      metaParentType: '',
    },
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'topic'),
    isValidTargetPos: () => false,
  },
  {
    id: 'topic',
    type: 'topic',
    position: { x: 250, y: 150 },
    data: {
      metaParentType: 'module',
    },
    //Called when source handle is used for connection
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'chapter'),
    //Called when target handle is used for connection
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'module'),
  },
  {
    id: 'chapter',
    type: 'chapter',
    position: { x: 250, y: 300 },
    data: {
      metaParentType: 'topic',
    },
    isValidSourcePos: (connection: Connection) => checkType(connection.source, 'interactivetask'),
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'topic'),
  },
  {
    id: 'interactive_task',
    type: 'interactivetask',
    position: { x: 250, y: 450 },
    data: {
      metaParentType: 'chapter',
    },
    isValidSourcePos: () => false,
    isValidTargetPos: (connection: Connection) => checkType(connection.target, 'chapter'),
  },
]);

let id = 0;
const getId = () => `dndnode_${id++}`;
const { addEdges, nodes, addNodes, project } = useVueFlow();
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

const onConnect = (params: Connection) => addEdges([{ ...params, type: 'smoothstep' }]);

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow/type');
  const metaParentType = event.dataTransfer?.getData('application/vueflow/metaParentType');
  console.log(metaParentType);

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
    data: {
      metaParentType,
    },
    isValidSourcePos: (connection: Connection) => checkType(connection.source, type),
    isValidTargetPos: (connection: Connection) => checkType(connection.target, metaParentType),
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
      <MiniMap />
      <Background pattern-color="#aaa" gap="8" />
      <Controls />
    </VueFlow>
    <Sidebar :nodes="initNodes" />
  </div>
</template>
