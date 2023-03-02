import { Connection, Edge, GraphEdge, GraphNode, Node } from '@vue-flow/core';
import { Ref } from 'vue';
import { NodeData, NodeModel, NodeType } from 'models';
import { d3Hierarchy, ImportSpacing } from 'utils/import';
import { hierarchy, HierarchyPointLink, tree } from 'd3';
import { NodesData } from 'models/NodeData';

export const getNodeById = (id: string, nodes: Ref<GraphNode<any, any>[]>): Node | undefined => {
  return nodes.value.filter((el) => {
    return el.id === id;
  })[0];
};
export const edgeContainsNode = (edge: GraphEdge, node: Node) => {
  return edge.id.includes(node.id);
};
export const edgeContainsNodeType = (edge: GraphEdge, type: string) => {
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

export const getValidationFunctions = (
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

export const createNode = (
  id: string,
  type: NodeType,
  position: { x: number; y: number },
  nodesRef: Ref<GraphNode<any, any>[]>,
  edgesRef: Ref<GraphEdge<any, any>[]>
): Node => {
  const data = {
    metaParentType: NodeModel[type].metaParentType,
    metaChildType: NodeModel[type].metaChildType,
    ...NodesData[type],
  };
  const validationFunctions = getValidationFunctions(data, nodesRef, edgesRef);

  return {
    id,
    type,
    label: id,
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

export const calculateTreeLayout = (
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
      const newNode = createNode(
        `…${node.data.id.slice(-5)}`,
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
      return createEdge(node.source.data.id, node.target.data.id);
    });
  } catch (e) {
    console.error(e);
  }
  return { edges: newEdges, nodes: newNodes };
};
