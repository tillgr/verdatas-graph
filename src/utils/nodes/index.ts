import { Connection, GraphEdge, Node, useVueFlow } from '@vue-flow/core';

const { edges, nodes } = useVueFlow();

const getNodeById = (id: string): Node | undefined => {
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
export const compareNodeTypes = (id: string, types?: string[]): boolean => {
  const node = getNodeById(id);
  return types?.some((type) => type === node?.type) || false;
};
export const checkForMultipleParents = (connection: Connection): boolean => {
  const source = getNodeById(connection.source);
  const target = getNodeById(connection.target);

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
