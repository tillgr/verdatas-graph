import { Chapter, IliasGraph, IliasNodeTypes, InteractiveTask, Module } from 'models/IliasGraph';
import { NodeType } from 'models';

export const ImportSpacing: [number, number] = [160, 100];

const parseJsonFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e: any) => resolve(JSON.parse(e?.target?.result));
    fr.onerror = (error) => reject(error);
    file && fr.readAsText(file);
  });
};

export type d3Hierarchy = {
  [data: string]: any;
  children: any[];
};

const filterJsonFile = (file: IliasGraph): d3Hierarchy => {
  const modules = file[IliasNodeTypes.Modules]?.map((module: Module) => {
    const chapters = module[IliasNodeTypes.Chapters]?.map((chapter: Chapter) => {
      const interactiveTasks = chapter[IliasNodeTypes.InteractiveTasks]?.map((task: InteractiveTask) => {
        return { id: task.object_id, type: NodeType.InteractiveTask };
      });
      return { id: chapter.object_id, type: NodeType.Chapter, children: interactiveTasks };
    });
    return { id: module.object_id, type: NodeType.Module, children: chapters };
  });

  return {
    id: file.object_id,
    type: 'topic',
    children: modules,
  };
};

export const importUtils = {
  parseJsonFile,
  filterJsonFile,
};
