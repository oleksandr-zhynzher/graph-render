import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DefaultGraphVertex } from '../DefaultGraphVertex';

const makeNode = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'n1',
    label: 'Node 1',
    position: { x: 0, y: 0 },
    size: { width: 120, height: 48 },
    ...overrides,
  }) as any;

describe('DefaultGraphVertex', () => {
  it('uses theme props for rect and text colors', () => {
    const { container } = render(
      <svg>
        <DefaultGraphVertex
          node={makeNode()}
          nodeFill="#f8fafc"
          nodeStroke="#cbd5e1"
          nodeTextColor="#0f172a"
          nodeTextSize={12}
          nodeRadius={6}
        />
      </svg>
    );
    const rect = container.querySelector('rect');
    const text = container.querySelector('text');
    expect(rect?.getAttribute('fill')).toBe('#f8fafc');
    expect(rect?.getAttribute('stroke')).toBe('#cbd5e1');
    expect(rect?.getAttribute('rx')).toBe('6');
    expect(text?.getAttribute('fill')).toBe('#0f172a');
    expect(text?.getAttribute('font-size')).toBe('12');
  });
});
