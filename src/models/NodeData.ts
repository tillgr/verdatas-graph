import { NodeType } from 'models/CustomNode';

type Module = {
  structure: string;
  processingTime: number;
  level: string;
};

type InteractiveTask = {
  concludeModule: boolean;
};

export const Nodes: Record<string, InteractiveTask | Module> = {
  [NodeType.Module]: {
    structure: '',
    processingTime: 0,
    level: '',
  },
  [NodeType.InteractiveTask]: {
    concludeModule: false,
  },
};
