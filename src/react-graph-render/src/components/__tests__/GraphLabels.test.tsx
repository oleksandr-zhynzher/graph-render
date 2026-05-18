import { LayoutDirection, LayoutType } from '@graph-render/types';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphLabels } from '../GraphLabels';

const makeNode = (id: string, x: number, y: number, width = 180) =>
  ({ id, position: { x, y }, size: { width, height: 72 } }) as any;

describe('GraphLabels', () => {
  const baseProps = {
    layout: LayoutType.Tree,
    layoutDirection: LayoutDirection.LTR,
    autoLabels: false,
    labelOffset: 32,
  };

  it('renders nothing when positionedNodes is empty', () => {
    const { container } = render(
      <svg>
        <GraphLabels {...baseProps} positionedNodes={[]} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="labels"]')).toBeNull();
  });

  it('renders nothing when no labels and autoLabels is false', () => {
    const { container } = render(
      <svg>
        <GraphLabels {...baseProps} positionedNodes={[makeNode('n1', 0, 0)]} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="labels"]')).toBeNull();
  });

  it('renders a label group with explicit labels', () => {
    const nodes = [makeNode('n1', 0, 0)];
    const { container } = render(
      <svg>
        <GraphLabels {...baseProps} positionedNodes={nodes} labels={['Step 1']} />
      </svg>
    );
    expect(container.querySelector('g[aria-label="labels"]')).not.toBeNull();
    expect(container).toHaveTextContent(/Step 1/);
  });

  it('renders multiple labels for multiple columns', () => {
    const nodes = [makeNode('n1', 0, 0), makeNode('n2', 600, 0)];
    const { container } = render(
      <svg>
        <GraphLabels {...baseProps} positionedNodes={nodes} labels={['A', 'B']} />
      </svg>
    );
    expect(container).toHaveTextContent(/A/);
    expect(container).toHaveTextContent(/B/);
  });

  it('renders auto-generated labels when autoLabels is true', () => {
    const nodes = [makeNode('n1', 0, 0)];
    const { container } = render(
      <svg>
        <GraphLabels {...baseProps} positionedNodes={nodes} autoLabels />
      </svg>
    );
    expect(container.querySelector('g[aria-label="labels"]')).not.toBeNull();
  });

  it('applies custom pillBackground color', () => {
    const nodes = [makeNode('n1', 0, 0)];
    const { container } = render(
      <svg>
        <GraphLabels
          {...baseProps}
          positionedNodes={nodes}
          labels={['X']}
          pillBackground="#123456"
        />
      </svg>
    );
    const rect = container.querySelector('g[aria-label="labels"] rect');
    expect(rect?.getAttribute('fill')).toBe('#123456');
  });

  it('applies custom pillBorderColor', () => {
    const nodes = [makeNode('n1', 0, 0)];
    const { container } = render(
      <svg>
        <GraphLabels
          {...baseProps}
          positionedNodes={nodes}
          labels={['X']}
          pillBorderColor="#aabbcc"
        />
      </svg>
    );
    const rect = container.querySelector('g[aria-label="labels"] rect');
    expect(rect?.getAttribute('stroke')).toBe('#aabbcc');
  });

  it('applies custom pillTextColor to label text', () => {
    const nodes = [makeNode('n1', 0, 0)];
    const { container } = render(
      <svg>
        <GraphLabels
          {...baseProps}
          positionedNodes={nodes}
          labels={['X']}
          pillTextColor="#ff0000"
        />
      </svg>
    );
    const text = container.querySelector('g[aria-label="labels"] text');
    expect(text?.getAttribute('fill')).toBe('#ff0000');
  });
});
