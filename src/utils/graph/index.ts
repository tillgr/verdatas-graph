import { Connection, Edge, GraphEdge, GraphNode, Node } from '@vue-flow/core';
import { Ref } from 'vue';
import { NodeData, NodeModel, NodeType } from 'models';
import { d3Hierarchy, ImportSpacing } from 'utils/import';
import { hierarchy, HierarchyPointLink, tree } from 'd3';

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
const matchNodeTypes = (id: string, nodes: Ref<GraphNode<any, any>[]>, types?: (NodeType | undefined)[]): boolean => {
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

const getValidationFunctions = (
  nodeData: NodeData,
  nodesRef: Ref<GraphNode<any, any>[]>,
  edgesRef: Ref<GraphEdge<any, any>[]>
) => {
  const { metaParentType, metaChildType } = nodeData;

  const isValidSourcePos = (connection: Connection) =>
    matchNodeTypes(connection.source, nodesRef, [metaParentType, metaChildType]) &&
    checkForMultipleParents(connection, nodesRef, edgesRef);

  const isValidTargetPos = (connection: Connection) =>
    matchNodeTypes(connection.target, nodesRef, [metaParentType, metaChildType]) &&
    checkForMultipleParents(connection, nodesRef, edgesRef);

  return {
    isValidSourcePos,
    isValidTargetPos,
  };
};

const createNode = (
  id: string,
  type: NodeType,
  position: { x: number; y: number },
  nodesRef: Ref<GraphNode<any, any>[]>,
  edgesRef: Ref<GraphEdge<any, any>[]>
): Node => {
  const data = { metaParentType: NodeModel[type].metaParentType, metaChildType: NodeModel[type].metaChildType };
  const validationFunctions = getValidationFunctions(data, nodesRef, edgesRef);

  return {
    id,
    type,
    label: `${type}_node`,
    position,
    data,
    ...validationFunctions,
  };
};

const createEdge = (source: string, target: string): Edge => {
  const id = source + target;

  return {
    id,
    source,
    target,
  };
};

const calculateTreeLayout = (
  hierarchyData: d3Hierarchy,
  nodesRef: Ref<GraphNode<any, any>[]>,
  edgesRef: Ref<GraphEdge<any, any>[]>
) => {
  const root = hierarchy(hierarchyData);
  const _tree = tree().nodeSize(ImportSpacing)(root);
  const newNodes: Node[] = [];
  let newEdges: Edge[] = [];

  try {
    _tree.each((node: any) => {
      const newNode = graphUtils.createNode(
        node.data.id,
        node.data.type.toLowerCase(),
        {
          x: node.x,
          y: node.y,
        },
        nodesRef,
        edgesRef
      );
      newNodes.push(newNode);
    });

    newEdges = _tree.links().map((node: HierarchyPointLink<any>) => {
      return graphUtils.createEdge(node.source.data.id, node.target.data.id);
    });
  } catch (e) {
    console.error(e);
  }
  return { edges: newEdges, nodes: newNodes };
};

export const graphUtils = {
  getNodeById,
  edgeContainsNode,
  edgeContainsNodeType,
  compareNodeTypes: matchNodeTypes,
  checkForMultipleParents,
  getValidationFunctions,
  createNode,
  createEdge,
  calculateTreeLayout,
};
