<script setup lang="ts">
import {
  Connection,
  ConnectionMode,
  FlowEvents,
  NodeMouseEvent,
  useVueFlow,
  VueFlow,
  VueFlowStore,
} from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { computed, ref, watch } from 'vue';
import { NodeType } from 'models';
import { graphUtils } from 'utils';
import { basicOptions } from 'models/NodeData';
import useStore from 'store';

const store = useStore();
const historyLocation = ref(0);
const historyUsed = ref(false);

// https://stackoverflow.com/questions/73612018/how-to-create-history-data-in-pinia
watch(
  () => store.elements,
  (data: unknown[], oldData: unknown[]) => {
    if (!isEqualDeep(data, oldData) && !historyUsed.value) {
      store.pushToHistory(data);
      console.log('history', store.history);
    }
    historyUsed.value = false;
  },
  { deep: true }
);

const observedKeys = ['data', 'id', 'type', 'sourceNode', 'targetNode'];

const filterByKeys = (item: any, keys: string[]) => {
  return Object.keys(item)
    .filter((key) => keys.includes(key))
    .reduce((obj, key) => {
      return {
        ...obj,
        [key]: item[key],
      };
    }, {});
};

const undo = () => {
  historyUsed.value = true;
  store.elements = store.history.at(-2 - historyLocation.value) || [];
  // historyLocation.value = historyLocation.value + 2;
  historyLocation.value++;

  console.log('elements', store.elements);
};

// https://stackoverflow.com/questions/27030/comparing-arrays-of-objects-in-javascript
const objectsEqual = (o1: any, o2: any): boolean =>
  typeof o1 === 'object' && Object.keys(o1).length > 0
    ? Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every((p) => objectsEqual(o1[p], o2[p]))
    : o1 === o2;

const arraysEqual = (a1: any[], a2: any[]) =>
  a1.length === a2.length && a1.every((o: any, idx: number) => objectsEqual(o, a2[idx]));

const isEqualDeep = (data: any[], oldData: any[]): boolean => {
  const filteredData = data.map((item: { [key: string]: any }) => filterByKeys(item, observedKeys));
  const filteredOldData = oldData.map((item: { [key: string]: any }) => filterByKeys(item, observedKeys));

  return arraysEqual(filteredData, filteredOldData);
};

let id = 0;
const getNodeId = () => `dragged_${id++}`;
const { addEdges, addNodes, project, nodes, edges, findNode, updateEdge, removeNodes, removeEdges } = useVueFlow({
  minZoom: 0.2,
  maxZoom: 4,
  connectOnClick: true,
  fitViewOnInit: false,
});

const wrapper = ref();
const hasTopic = computed(() => {
  return nodes.value.some((node) => {
    return node?.type === NodeType.Topic;
  });
});

const options = ref({
  label: '',
  data: { ...basicOptions },
});
const currentNodeId = ref('');
const optionKeys = computed(() => Object.keys(options.value.data) ?? []);

const edgeUpdateSuccessful = ref(true);

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
  if (!event.node) return;
  currentNodeId.value = event.node.id;

  const { metaParentType, metaChildType, ...rest } = event.node.data;
  options.value = { label: event.node.label as string, data: { ...rest } };
};

const onDrop = (event: DragEvent) => {
  const type = event.dataTransfer?.getData('application/vueflow/type') as NodeType;
  if (type === NodeType.Topic && hasTopic.value) return;

  const flowbounds = wrapper.value.$el.getBoundingClientRect();
  const position = project({
    x: event.clientX - flowbounds.left,
    y: event.clientY - flowbounds.top,
  });

  const newNode = graphUtils.createNode(getNodeId(), type, position, nodes, edges);
  addNodes([newNode]);
};
const updateNode = () => {
  const node = findNode(currentNodeId.value);
  if (!node) return;

  node.label = options.value.label;
  node.data = { ...node.data, ...options.value.data };
  node.style = { backgroundColor: options.value.data.background };
};
const onEdgeUpdateStart = () => {
  edgeUpdateSuccessful.value = false;
};
const onEdgeUpdateEnd = ({ edge }: FlowEvents['edgeUpdateEnd']) => {
  !edgeUpdateSuccessful.value && removeEdges([edge]);
};
const onEdgeUpdate = ({ edge, connection }: FlowEvents['edgeUpdate']) => {
  edgeUpdateSuccessful.value = true;
  updateEdge(edge, connection);
};
const deleteNode = () => {
  removeNodes([currentNodeId.value]);
};
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <Sidebar />
    <VueFlow
      v-model="store.elements"
      auto-connect
      :edges-updatable="true"
      :snap-to-grid="true"
      :connection-mode="ConnectionMode.Loose"
      :connection-radius="50"
      class="validationflow"
      ref="wrapper"
      @dragover="onDragOver"
      @connect="onConnect"
      @pane-ready="onLoad"
      @connect-start="onConnectStart"
      @connect-end="onConnectEnd"
      @node-click="onNodeClick"
      @edge-update="onEdgeUpdate"
      @edge-update-start="onEdgeUpdateStart"
      @edge-update-end="onEdgeUpdateEnd"
    >
      <div style="position: absolute; left: 10px; top: 10px; z-index: 4">
        <button @click="store.log">log store state</button>
        <button @click="undo">semantic undo</button>
      </div>
      <Background pattern-color="#aaa" gap="8" />
      <MiniMap />
      <Controls />
      <div class="updatenode__controls">
        <label>label:</label>
        <input v-model="options.label" @input="updateNode" />
        <div v-for="key of optionKeys">
          <label>{{ key }}:</label>
          <input v-if="key === 'background'" v-model="options.data.background" type="color" @input="updateNode" />
          <select v-else-if="typeof options.data[key] == 'boolean'" v-model="options.data[key]">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <input v-else v-model="options.data[key]" @input="updateNode" />
        </div>
        <button class="delete-button" @click="deleteNode">delete</button>
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
    </VueFlow>
  </div>
</template>

<style>
@import 'updatenode.css';
</style>
