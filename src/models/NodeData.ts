import { NodeType } from 'models/CustomNode';

export type ModuleOptions = {
  structure: string;
  processingTime: number;
  level: string;
};

export type InteractiveTaskOptions = {
  concludeModule: boolean;
};

export const basicOptions = {
  background: '#ffffff',
};

export const NodesData: Record<string, InteractiveTaskOptions | ModuleOptions | typeof basicOptions> = {
  [NodeType.Topic]: {
    ...basicOptions,
  },
  [NodeType.Module]: {
    ...basicOptions,
    structure: '',
    processingTime: 0,
    level: '',
  },
  [NodeType.Chapter]: {
    ...basicOptions,
  },
  [NodeType.InteractiveTask]: {
    ...basicOptions,
    concludeModule: false,
  },
};
