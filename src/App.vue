<script setup lang="ts">
import {
  Connection,
  GraphEdge,
  GraphNode,
  Node,
  NodeMouseEvent,
  useVueFlow,
  VueFlow,
  VueFlowStore,
} from '@vue-flow/core';
import { Background, Controls, MiniMap } from '@vue-flow/additional-components';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { reactive, Ref, ref } from 'vue';
import { NodeData, NodeModel, NodeType } from 'models';
import { nodeUtils } from 'utils';

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
const getNodeId = () => `dragged_${id++}`;
const { addEdges, addNodes, project, nodes, edges, findNode } = useVueFlow();
const wrapper = ref();

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

const onNodeClick = (event: NodeMouseEvent) => {
  currentNode.id = event.node.id;
  opts.label = event.node.label!.toString(); //TODO fix
};

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow/type') as NodeType;
  const metaParentType = NodeModel[type].metaParentType;
  const metaChildType = NodeModel[type].metaChildType;
  const data = { metaParentType: NodeModel[type].metaParentType, metaChildType: NodeModel[type].metaChildType };

  const flowbounds = wrapper.value.$el.getBoundingClientRect();
  const position = project({
    x: event.clientX - flowbounds.left,
    y: event.clientY - flowbounds.top,
  });

  const getValidationFunctions = (
    nodeData: NodeData,
    nodesRef: Ref<GraphNode<any, any>[]>,
    edgesRef: Ref<GraphEdge<any, any>[]>
  ) => {
    const { metaParentType, metaChildType } = nodeData;

    return {
      isValidSourcePos: (connection: Connection) =>
        nodeUtils.compareNodeTypes(connection.source, nodesRef, [metaParentType, metaChildType]) &&
        nodeUtils.checkForMultipleParents(connection, nodesRef, edgesRef),
      isValidTargetPos: (connection: Connection) =>
        nodeUtils.compareNodeTypes(connection.target, nodesRef, [metaParentType, metaChildType]) &&
        nodeUtils.checkForMultipleParents(connection, nodesRef, edgesRef),
    };
  };

  const validationFunctions = getValidationFunctions(data, nodes, edges);

  console.log(validationFunctions);

  const newNode: Node = {
    id: getNodeId(),
    type,
    position,
    label: `${type}_node`,
    data,
    ...validationFunctions,
  };
  addNodes([newNode]);
};

const opts = reactive({
  bg: '#eeeeee',
  label: '',
});
const currentNode = reactive({
  id: '',
});
const updateNode = () => {
  const node = findNode(currentNode.id)!;
  node.label = opts.label;
  node.style = { backgroundColor: opts.bg };
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
      @node-click="onNodeClick"
    >
      <div class="updatenode__controls">
        <label>label:</label>
        <input v-model="opts.label" @input="updateNode" />

        <label class="updatenode__bglabel">background:</label>
        <input v-model="opts.bg" type="color" @input="updateNode" />
      </div>
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

<style>
@import 'updatenode.css';
</style>
