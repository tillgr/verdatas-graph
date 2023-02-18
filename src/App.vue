<script setup lang="ts">
import { Connection, NodeMouseEvent, useVueFlow, VueFlow, VueFlowStore } from '@vue-flow/core';
import { Background, Controls, MiniMap } from '@vue-flow/additional-components';
import Module from './components/Module.vue';
import Chapter from './components/Chapter.vue';
import Topic from './components/Topic.vue';
import InteractiveTask from './components/InteractiveTask.vue';
import Sidebar from './components/Sidebar.vue';
import { computed, ref } from 'vue';
import { NodeType } from 'models';
import { graphUtils } from 'utils';
import { Nodes } from 'models/NodeData';

let id = 0;
const getNodeId = () => `dragged_${id++}`;
const { addEdges, addNodes, project, nodes, edges, findNode } = useVueFlow();
const wrapper = ref();
const hasTopic = computed(() => {
  return nodes.value.some((node) => {
    return node?.type === NodeType.Topic;
  });
});

const basicOptions = {
  bg: '#eeeeee',
  label: '',
};
const options = ref({ ...basicOptions });
const optionKeys = computed(() => Object.keys(options.value).slice(Object.keys(basicOptions).length));

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
  const { bg, label } = options.value;
  options.value = { bg, label, ...Nodes[event.node.type as NodeType] } || {};
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
const updateNode = (e: InputEvent) => {
  console.log(options.value);
  //TODO copy state into data of the node or write directly into the node data
};
</script>

<template>
  <div class="dndflow" @drop="onDrop">
    <Sidebar />
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
        <input v-model="options.label" @input="updateNode" />

        <label class="updatenode__bglabel">background:</label>
        <input v-model="options.bg" type="color" @input="updateNode" />

        <div v-for="key of optionKeys">
          <label>{{ key }}</label>
          <select v-if="typeof options[key] == 'boolean'">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <input v-else v-model="options[key]" @input="updateNode" />
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
      <MiniMap />
      <Background pattern-color="#aaa" gap="8" />
      <Controls />
    </VueFlow>
  </div>
</template>

<style>
@import 'updatenode.css';
</style>
