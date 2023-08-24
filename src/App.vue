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
import useStore from 'store';
import { isEqualDeep } from 'utils/history';
import { createNode } from 'utils/graph';

const defaultHistoryLocation = -1;
const defaultOptions = {
  label: '',
  data: {},
};

const { addEdges, addNodes, project, nodes, edges, findNode, updateEdge, removeNodes, removeEdges } = useVueFlow({
  minZoom: 0.2,
  maxZoom: 4,
  connectOnClick: true,
  fitViewOnInit: false,
});
const wrapper = ref();

let newNodeId = computed(() => {
  const ids = nodes.value.map((node) => {
    if (typeof +node.id !== 'number') return 0;
    return +node.id;
  });
  if (!ids.length) return 0;
  return Math.max(...ids);
});

const edgeUpdateSuccessful = ref(true);
const currentNodeId = ref('');
const options = ref(defaultOptions);
const resetOptions = () => {
  options.value = defaultOptions;
};
const isEditingMaskLocked = ref(false);

const store = useStore();
const historyLocation = ref(defaultHistoryLocation);
const resetHistoryLocation = () => {
  historyLocation.value = defaultHistoryLocation;
};
const observedKeys = ['data', 'id', 'type', 'sourceNode', 'targetNode'];
const historyUsed = ref(false);

const hasTopic = computed(() => {
  return nodes.value.some((node) => {
    return node?.type === NodeType.Topic;
  });
});
const optionKeys = computed(() => Object.keys(options.value.data) ?? []);

// https://stackoverflow.com/questions/73612018/how-to-create-history-data-in-pinia
watch(
  () => store.elements,
  (data: unknown[], oldData: unknown[]) => {
    //new action => new state observed
    if (!isEqualDeep(data, oldData, observedKeys) && !historyUsed.value) {
      store.clearHistoryAbove(historyLocation.value);
      store.pushToHistory(data);
      resetHistoryLocation();
    }
    historyUsed.value = false;
  },
  { deep: true }
);

const getNodeId = () => {
  return (newNodeId.value + 1).toString();
};

const undo = () => {
  historyUsed.value = true;

  if (historyLocation.value >= -store.history.length) {
    historyLocation.value--;
    store.elements = store.history.at(historyLocation.value) || [];
  }
};
const redo = () => {
  historyUsed.value = true;

  if (historyLocation.value < -1) {
    historyLocation.value++;
    store.elements = store.history.at(historyLocation.value) || [];
  }
};

const onPaneClick = () => {
  resetOptions();
};

const onLoad = (flowInstance: VueFlowStore) => flowInstance.fitView();

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
  const type = event.dataTransfer?.getData('application/vueflow/type') as NodeType;
  if (type === NodeType.Topic && hasTopic.value) return;

  const flowbounds = wrapper.value.$el.getBoundingClientRect();
  const position = project({
    x: event.clientX - flowbounds.left,
    y: event.clientY - flowbounds.top,
  });

  const nodeId = getNodeId();

  const newNode = createNode(nodeId, type, position, nodes, edges, `node_${nodeId}`);
  addNodes([newNode]);
};

const onNodeClick = (event: NodeMouseEvent) => {
  if (!event.node) return;
  currentNodeId.value = event.node.id;

  const { metaParentType, metaChildType, ...rest } = event.node.data;
  options.value = { label: event.node.label as string, data: { ...rest } };
};
const updateNode = () => {
  const node = findNode(currentNodeId.value);
  if (!node) return;

  node.label = options.value.label;
  node.data = { ...node.data, ...options.value.data };
};
const deleteNode = () => {
  removeNodes([currentNodeId.value]);
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
      @node-click="onNodeClick"
      @pane-click="onPaneClick"
      @edge-update="onEdgeUpdate"
      @edge-update-start="onEdgeUpdateStart"
      @edge-update-end="onEdgeUpdateEnd"
    >
      <div class="history-controls">
        <button @click="undo">
          <b-icon-arrow-counterclockwise />
          undo
        </button>
        <button @click="redo">
          <b-icon-arrow-clockwise />
          redo
        </button>
      </div>
      <Background pattern-color="#aaa" :gap="8" />
      <MiniMap />
      <Controls
        @interaction-change="
          () => {
            isEditingMaskLocked = !isEditingMaskLocked;
          }
        "
      />
      <div class="updatenode__controls">
        <div v-if="isEditingMaskLocked" class="locker"></div>
        <h2>Edit node</h2>
        <div>
          <div class="mask-item">
            <label>label:</label>
            <input type="text" v-model="options.label" @input="updateNode" />
          </div>
          <div class="mask-item" v-for="key of optionKeys">
            <label>{{ key }}:</label>
            <select
              v-if="typeof options.data[key] == 'boolean' || key.toLowerCase() === 'concludemodule'"
              v-model="options.data[key]"
              @change="updateNode"
            >
              <option :value="true">true</option>
              <option :value="false">false</option>
            </select>
            <input type="text" v-else v-model="options.data[key]" @input="updateNode" />
          </div>
          <div class="mask-item">
            <button class="delete-button" @click="deleteNode">delete</button>
          </div>
        </div>
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
