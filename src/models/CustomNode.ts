import { Node } from '@vue-flow/core';

export type CustomNode = Node &
  Required<{
    type: string;
    label: string;
    data: {
      metaParentType: string;
      metaChildType: string;
    };
  }>;
