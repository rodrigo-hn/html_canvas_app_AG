import { describe, expect, it } from 'vitest';
import { DiagramStore } from './diagram-store.service';

describe('DiagramStore', () => {
  it('updates selection and edge selection independently', () => {
    const store = new DiagramStore();
    store.setSelection(new Set(['n1', 'n2']));
    store.setSelectedEdgeId('e1');

    expect(Array.from(store.selection())).toEqual(['n1', 'n2']);
    expect(store.selectedEdgeId()).toBe('e1');

    store.updateSelection((prev) => {
      const next = new Set(prev);
      next.delete('n1');
      return next;
    });
    store.setSelectedEdgeId(null);

    expect(Array.from(store.selection())).toEqual(['n2']);
    expect(store.selectedEdgeId()).toBe(null);
  });

  it('persists snap settings and edge preview state', () => {
    const store = new DiagramStore();
    store.setSnapToGrid(false);
    store.setGridSize(30);
    store.setEdgePreview({
      sourceId: 'n1',
      sourcePort: 'right',
      targetPoint: { x: 300, y: 200 },
    });

    expect(store.snapToGrid()).toBe(false);
    expect(store.gridSize()).toBe(30);
    expect(store.edgePreview()).toEqual({
      sourceId: 'n1',
      sourcePort: 'right',
      targetPoint: { x: 300, y: 200 },
    });
  });
});
