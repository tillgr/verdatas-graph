//TOPIC > MODULE > CHAPTER > INTERACTIVE_TASK

export type IliasGraph = {
  //TOPIC
  modules: [Module];
} & hasId &
  otherKeys;

export type Module = {
  chapters: [Chapter];
} & hasId &
  otherKeys;

export type Chapter = {
  [IliasNodeTypes.InteractiveTasks]: [InteractiveTask];
} & hasId &
  otherKeys;

export type InteractiveTask = hasId & otherKeys;

type otherKeys = {
  [key: string]: string;
};

type hasId = {
  object_id: string;
};

export enum IliasNodeTypes {
  Modules = 'modules',
  Chapters = 'chapters',
  InteractiveTasks = 'interactiveTasks',
}
