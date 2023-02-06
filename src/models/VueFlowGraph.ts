import { Edge, Node } from '@vue-flow/core';

export type VueFlowGraph = {
  nodes: Node[];
  edges: Edge[];
  position: [];
  zoom: number;
};
