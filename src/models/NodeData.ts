import { NodeType } from 'models/CustomNode';

export type ModuleOptions = {
  structure: string;
  processingTime: number;
  level: string;
};

export type InteractiveTaskOptions = {
  concludeModule: boolean;
};

export const NodesData: Record<string, InteractiveTaskOptions | ModuleOptions> = {
  [NodeType.Module]: {
    structure: '',
    processingTime: 0,
    level: '',
  },
  [NodeType.InteractiveTask]: {
    concludeModule: false,
  },
};
