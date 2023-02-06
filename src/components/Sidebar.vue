<script lang="ts" setup>
import { Edge, Node, useVueFlow } from '@vue-flow/core';
import { hierarchy, HierarchyPointLink, tree } from 'd3';
import { NodeModel, NodeType, VueFlowGraph } from 'models';
import { ImportSpacing } from 'utils';
import { Chapter, IliasGraph, IliasNodeTypes, InteractiveTask, Module } from 'models/IliasGraph';

const props = defineProps(['nodes']);

const { toObject, nodes, removeNodes, addNodes, addEdges } = useVueFlow();

const onDragStart = (event: DragEvent, node: Node) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/vueflow/type', node.type || '');
    event.dataTransfer.setData('application/vueflow/metaParentType', node.data.metaParentType);
    event.dataTransfer.setData('application/vueflow/metaChildType', node.data.metaChildType);
    event.dataTransfer.effectAllowed = 'move';
  }
};
const handleExport = () => {
  const data = JSON.stringify(toObject());
  const blob = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');

  a.download = 'test.json';
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  a.click();
  window.URL.revokeObjectURL(a.href);
};

const parseJsonFile = async (file: File) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = (e: any) => resolve(JSON.parse(e?.target?.result));
    fr.onerror = (error) => reject(error);
    file && fr.readAsText(file);
  });
};

const handleImport = async (e: Event) => {
  const file = (<HTMLInputElement>e?.target).files?.[0];
  if (!file) return;

  return await parseJsonFile(file);
};

const filterJsonFile = (file: IliasGraph) => {
  if (!file) return;
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

const importGraph = async (e: Event) => {
  const file = <VueFlowGraph | undefined>await handleImport(e);
  if (file) {
    removeNodes(nodes.value, true);
    addNodes(file.nodes);
    addEdges(file.edges);
  }
};

const importIlias = async (e: Event) => {
  const file = <IliasGraph | undefined>await handleImport(e);

  if (file) {
    const filtered = filterJsonFile(file);
    removeNodes(nodes.value, true);

    const root = hierarchy(filtered);
    const _tree = tree().nodeSize(ImportSpacing)(root);

    const _nodes: Node[] = [];
    let _edges: Edge[] = [];

    try {
      _tree.each((node: any) => {
        const type: NodeType = node.data.type.toLowerCase();
        const metaParentType = NodeModel[type].metaParentType;
        const metaChildType = NodeModel[type].metaChildType; //TODO extract method for creating nodes

        const newNode: Node = {
          id: node.data.id,
          type,
          label: `${type}_node`,
          position: { x: node.x, y: node.y }, //TODO Add validation back in, via blueprint objects in utils
          data: {
            metaParentType,
            metaChildType,
          },
        };

        _nodes.push(newNode);
      });

      _edges = _tree.links().map((node: HierarchyPointLink<any>) => {
        const source: string = node.source.data.id;
        const target: string = node.target.data.id;
        const id = source + target;

        return {
          id,
          source,
          target,
        };
      });
    } catch (e) {
      console.error(e);
    }

    addNodes(_nodes);
    addEdges(_edges);
  }
};
</script>

<template>
  <aside>
    <div class="description">You can drag these nodes to the pane on the left.</div>
    <div
      v-for="node in props.nodes"
      class="node-templates"
      :class="'vue-flow__node-' + node.type"
      :draggable="true"
      @dragstart="(event: DragEvent) => onDragStart(event, node)"
    >
      {{ node.type }}
    </div>
    <button class="export-button" @click="handleExport">Export graph</button>
    <div class="file-input">
      <label for="graph-input">Import graph</label>
      <input type="file" id="selectFiles" accept=".json" name="graph-input" @change="(e) => importGraph(e)" />
    </div>
    <div class="file-input">
      <label for="ilias-input">Import from ilias</label>
      <input type="file" id="selectFiles" accept=".json" name="ilias-input" @change="(e) => importIlias(e)" />
    </div>
  </aside>
</template>

<style scoped>
.file-input {
  display: flex;
  flex-direction: column;
}

.file-input * {
  width: fit-content;
}

.node-templates {
  width: 150px;
  border-radius: 5px;
  padding: 10px;
  color: #555;
  text-align: center;
  font-size: 12px;
  background-color: white;
}

aside {
  min-width: 260px;
}

.export-button {
  margin-right: auto;
  margin-top: 2rem;
  display: block;
}
</style>
