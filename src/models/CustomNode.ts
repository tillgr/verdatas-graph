export enum NodeType {
  Topic = 'topic',
  Module = 'module',
  Chapter = 'chapter',
  InteractiveTask = 'interactivetask',
}

export type NodeData = {
  metaParentType?: NodeType;
  metaChildType?: NodeType;
};
export const NodeModel: Record<NodeType, NodeData> = {
  [NodeType.Topic]: {
    metaChildType: NodeType.Module,
  },
  [NodeType.Module]: {
    metaParentType: NodeType.Topic,
    metaChildType: NodeType.Chapter,
  },
  [NodeType.Chapter]: {
    metaParentType: NodeType.Module,
    metaChildType: NodeType.InteractiveTask,
  },
  [NodeType.InteractiveTask]: {
    metaParentType: NodeType.Chapter,
  },
};
