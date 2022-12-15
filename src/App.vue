<script setup lang="ts">
import { Connection, GraphEdge, Node, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';
import { Background, Controls, MiniMap } from '@vue-flow/additional-components';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { ref } from 'vue';

const initNodes = ref([
  {
    id: 'topic',
    type: 'topic',
    position: { x: 250, y: 0 },
    data: {
      metaParentType: '',
      metaChildType: 'module',
    },
  },
  {
    id: 'module',
    type: 'module',
    position: { x: 250, y: 150 },
    data: {
      metaParentType: 'topic',
      metaChildType: 'chapter',
    },
  },
  {
    id: 'chapter',
    type: 'chapter',
    position: { x: 250, y: 300 },
    data: {
      metaParentType: 'module',
      metaChildType: 'interactivetask',
    },
  },
  {
    id: 'interactive_task',
    type: 'interactivetask',
    position: { x: 250, y: 450 },
    data: {
      metaParentType: 'chapter',
      metaChildType: '',
    },
  },
]);

let id = 0;
const getId = () => `dndnode_${id++}`;
const { edges, addEdges, nodes, addNodes, project } = useVueFlow();
const wrapper = ref();

const getNodeById = (id: string): Node | undefined => {
  return nodes.value.filter((el) => {
    return el.id === id;
  })[0];
};

const edgeContainsNode = (edge: GraphEdge, node: Node) => {
  return edge.id.includes(node.id);
};

const edgeContainsType = (edge: GraphEdge, type: string) => {
  return edge.sourceNode.type === type || edge.targetNode.type === type;
};

const compareTypes = (id: string, types?: string[]): boolean => {
  const node = getNodeById(id);
  return types?.some((type) => type === node?.type) || false;
};

const hasNoParent = (connection: Connection): boolean => {
  const source = getNodeById(connection.source);
  const target = getNodeById(connection.target);

  if (!(source && target)) {
    return false;
  }
  const sourceParentType = source?.data.metaParentType;
  const targetType = target.type;

  const child = targetType === sourceParentType ? source : target;
  return !edges.value.some(
    (edge) => edgeContainsNode(edge, child) && edgeContainsType(edge, child.data.metaParentType)
  );
};

const onLoad = (flowInstance: VueFlowStore) => flowInstance.fitView();

const onConnectStart = ({ nodeId, handleType }: { [key: string]: string }) =>
  console.log('on connect start', { nodeId, handleType });

const onConnectEnd = (event: Event) => console.log('on connect end', event);

const onConnect = (params: Connection) => {
  addEdges([{ ...params, type: 'smoothstep' }]);
};

const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
};

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow/type');
  const metaParentType = event.dataTransfer?.getData('application/vueflow/metaParentType') || '';
  const metaChildType = event.dataTransfer?.getData('application/vueflow/metaChildType') || '';

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
      metaChildType,
    },
    isValidSourcePos: (connection: Connection) =>
      compareTypes(connection.source, [metaParentType, metaChildType]) && hasNoParent(connection),
    isValidTargetPos: (connection: Connection) =>
      compareTypes(connection.target, [metaParentType, metaChildType]) && hasNoParent(connection),
  } as Node;
  addNodes([newNode]);
};
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <Sidebar :nodes="initNodes" />
    <VueFlow
      fit-view-on-init
      class="validationflow"
      ref="wrapper"
      @dragover="onDragOver"
      @connect="onConnect"
      @pane-ready="onLoad"
      @connect-start="onConnectStart"
      @connect-end="onConnectEnd"
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
  </div>
</template>
