import { describe, expect, it } from 'vitest';
import { DiagramStore } from './diagram-store.service';
import { DiagramCommands } from './diagram-commands.service';
import { DiagramEdge, ShapeNode } from '../models/diagram.model';

function seedNode(id: string, x: number, y: number, text: string): ShapeNode {
  return {
    id,
    type: 'shape',
    shapeType: 'bpmn-task',
    x,
    y,
    width: 140,
    height: 80,
    zIndex: 1,
    data: { text },
    style: { fill: '#ffffff', stroke: '#111111', strokeWidth: 2 },
  };
}

function seedEdge(id: string, sourceId: string, targetId: string): DiagramEdge {
  return {
    id,
    sourceId,
    targetId,
    sourcePort: 'right',
    targetPort: 'left',
    flowType: 'message',
    zIndex: 0,
    points: [],
    markerEnd: 'open-arrow',
    markerStart: 'open-circle',
    style: { stroke: '#1f2937', strokeWidth: 2, dashArray: '6 4' },
  };
}

describe('DiagramCommands', () => {
  it('adds and removes edges and updates selection state', () => {
    const store = new DiagramStore();
    const commands = new DiagramCommands(store);

    store.setNodes([seedNode('1', 100, 100, 'A'), seedNode('2', 320, 100, 'B')]);

    commands.addEdge(seedEdge('e-test', '1', '2'));

    expect(store.edges().some((e) => e.id === 'e-test')).toBe(true);

    commands.selectEdge('e-test');
    expect(store.selectedEdgeId()).toBe('e-test');

    commands.removeEdge('e-test');
    expect(store.edges().some((e) => e.id === 'e-test')).toBe(false);
    expect(store.selectedEdgeId()).toBe(null);
  });

  it('updates node data safely', () => {
    const store = new DiagramStore();
    const commands = new DiagramCommands(store);
    store.setNodes([seedNode('1', 100, 100, 'Original')]);
    const node = store.nodes().find((n) => n.id === '1') as ShapeNode;

    commands.updateNodeData(node.id, { text: 'Updated' });
    const updated = store.nodes().find((n) => n.id === node.id) as ShapeNode;
    expect(updated.data.text).toBe('Updated');
  });

  it('exports and loads JSON preserving edge semantics', () => {
    const store = new DiagramStore();
    const commands = new DiagramCommands(store);
    const nodes = [seedNode('1', 100, 100, 'A'), seedNode('2', 320, 100, 'B')];
    const edges = [seedEdge('e1', '1', '2')];
    store.setNodes(nodes);
    store.setEdges(edges);

    const json = commands.exportJson();
    commands.loadFromJson(json);

    expect(store.nodes().length).toBe(2);
    expect(store.edges().length).toBe(1);
    expect(store.edges()[0].flowType).toBe('message');
    expect(store.edges()[0].markerEnd).toBe('open-arrow');
    expect(store.edges()[0].markerStart).toBe('open-circle');
    expect(store.edges()[0].style?.dashArray).toBe('6 4');
  });
});
