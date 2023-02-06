import { Connection, GraphEdge, GraphNode, Node } from '@vue-flow/core';
import { Ref } from 'vue';
import { NodeType } from 'models';

const getNodeById = (id: string, nodes: Ref<GraphNode<any, any>[]>): Node | undefined => {
  return nodes.value.filter((el) => {
    return el.id === id;
  })[0];
};
const edgeContainsNode = (edge: GraphEdge, node: Node) => {
  return edge.id.includes(node.id);
};
const edgeContainsNodeType = (edge: GraphEdge, type: string) => {
  return edge.sourceNode.type === type || edge.targetNode.type === type;
};
const compareNodeTypes = (id: string, nodes: Ref<GraphNode<any, any>[]>, types?: (NodeType | undefined)[]): boolean => {
  const node = getNodeById(id, nodes);
  return types?.some((type) => type === node?.type) || false;
};
const checkForMultipleParents = (
  connection: Connection,
  nodes: Ref<GraphNode<any, any>[]>,
  edges: Ref<GraphEdge<any, any>[]>
): boolean => {
  const source = getNodeById(connection.source, nodes);
  const target = getNodeById(connection.target, nodes);

  if (!(source && target)) {
    return false;
  }
  const sourceParentType = source?.data.metaParentType;
  const targetType = target.type;

  const child = targetType === sourceParentType ? source : target;
  return !edges.value.some(
    (edge) => edgeContainsNode(edge, child) && edgeContainsNodeType(edge, child.data.metaParentType)
  );
};

export const nodeUtils = {
  getNodeById,
  edgeContainsNode,
  edgeContainsNodeType,
  compareNodeTypes,
  checkForMultipleParents,
};
