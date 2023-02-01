export const customNodeProps = {
  isValidTargetPos: {
    type: Function,
    required: true,
  },
  isValidSourcePos: {
    type: Function,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  data: {
    metaParentType: {
      type: String,
      required: true,
    },
  },
};
