export type customNodeProps = {
  isValidTargetPos: () => boolean;
  isValidSourcePos: () => boolean;
  id: string;
  type: string; //TODO Enum
  label: string;
  data: {
    metaParentType: string; //TODO Enum
    metaChildType: string;
  };
};
