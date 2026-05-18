import { describe, expect, it } from 'vitest';

import { applyMeasuredNodeSizes, pruneMeasuredNodeSizes } from '../graphNodeMeasurements';

const makeNode = (id: string) => ({ id, label: id }) as any;

describe('applyMeasuredNodeSizes', () => {
  it('applies measured sizes to matching nodes', () => {
    const nodes = [makeNode('n1'), makeNode('n2')];
    const sizes = { n1: { width: 100, height: 50 } };
    const result = applyMeasuredNodeSizes(nodes, sizes);
    expect(result[0]!.measuredSize).toEqual({ width: 100, height: 50 });
  });

  it('keeps existing measuredSize when node is not in sizes map', () => {
    const nodes = [{ ...makeNode('n2'), measuredSize: { width: 80, height: 40 } }];
    const result = applyMeasuredNodeSizes(nodes, {});
    expect(result[0]!.measuredSize).toEqual({ width: 80, height: 40 });
  });

  it('does not mutate the original nodes array', () => {
    const nodes = [makeNode('n1')];
    const result = applyMeasuredNodeSizes(nodes, { n1: { width: 100, height: 50 } });
    expect(result).not.toBe(nodes);
  });

  it('returns empty array for empty input', () => {
    expect(applyMeasuredNodeSizes([], {})).toHaveLength(0);
  });

  it('overwrites existing measuredSize with new size', () => {
    const nodes = [{ ...makeNode('n1'), measuredSize: { width: 1, height: 1 } }];
    const result = applyMeasuredNodeSizes(nodes, { n1: { width: 200, height: 100 } });
    expect(result[0]!.measuredSize).toEqual({ width: 200, height: 100 });
  });
});

describe('pruneMeasuredNodeSizes', () => {
  it('removes entries for node ids not in sourceNodes', () => {
    const current = {
      n1: { width: 100, height: 50 },
      n2: { width: 80, height: 40 },
    };
    const nodes = [makeNode('n1')];
    const result = pruneMeasuredNodeSizes(current, nodes);
    expect(result).toHaveProperty('n1');
    expect(result).not.toHaveProperty('n2');
  });

  it('returns the same reference when nothing is pruned', () => {
    const current = { n1: { width: 100, height: 50 } };
    const nodes = [makeNode('n1')];
    const result = pruneMeasuredNodeSizes(current, nodes);
    expect(result).toBe(current);
  });

  it('returns empty object when all nodes are removed', () => {
    const current = { n1: { width: 100, height: 50 } };
    const result = pruneMeasuredNodeSizes(current, []);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('returns empty object when current is empty', () => {
    const result = pruneMeasuredNodeSizes({}, [makeNode('n1')]);
    expect(Object.keys(result)).toHaveLength(0);
  });
});
