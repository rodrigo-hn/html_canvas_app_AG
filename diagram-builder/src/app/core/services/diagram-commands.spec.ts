import { describe, expect, it } from 'vitest';
import { DiagramStore } from './diagram-store.service';
import { DiagramCommands } from './diagram-commands.service';
import { ShapeNode } from '../models/diagram.model';

describe('DiagramCommands', () => {
  it('adds and removes edges and updates selection state', () => {
    const store = new DiagramStore();
    const commands = new DiagramCommands(store);

    commands.addEdge({
      id: 'e-test',
      sourceId: '1',
      targetId: '2',
      sourcePort: 'right',
      targetPort: 'left',
      zIndex: 0,
      points: [],
      markerEnd: 'arrow',
      style: { stroke: '#000', strokeWidth: 2 },
    });

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
    const node = store.nodes().find((n) => n.id === '1') as ShapeNode;

    commands.updateNodeData(node.id, { text: 'Updated' });
    const updated = store.nodes().find((n) => n.id === node.id) as ShapeNode;
    expect(updated.data.text).toBe('Updated');
  });

  it('exports and loads JSON', () => {
    const store = new DiagramStore();
    const commands = new DiagramCommands(store);

    const json = commands.exportJson();
    commands.loadFromJson(json);
    expect(store.nodes().length).toBeGreaterThan(0);
    expect(store.edges().length).toBeGreaterThan(0);
  });
});
