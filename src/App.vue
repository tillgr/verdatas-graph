<script setup lang="ts">
import { Connection, NodeMouseEvent, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';
import { Background } from '@vue-flow/background';
import { Controls } from '@vue-flow/controls';
import { MiniMap } from '@vue-flow/minimap';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { computed, ref } from 'vue';
import { NodeType } from 'models';
import { graphUtils } from 'utils';
import { basicOptions } from 'models/NodeData';

let id = 0;
const getNodeId = () => `dragged_${id++}`;
const { addEdges, addNodes, project, nodes, edges, findNode } = useVueFlow({
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
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <Sidebar />
    <VueFlow
      auto-connect
      :connection-radius="30"
      class="validationflow"
      ref="wrapper"
      @dragover="onDragOver"
      @connect="onConnect"
      @pane-ready="onLoad"
      @connect-start="onConnectStart"
      @connect-end="onConnectEnd"
      @node-click="onNodeClick"
    >
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
