import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphNodeFrame } from '../GraphNodeFrame';

const defaultProps = {
  width: 180,
  height: 72,
  radius: 8,
  borderOpacity: 1,
  borderWidth: 2,
  isFocused: false,
  selectionColor: '#f59e0b',
  focusStrokeWidth: 2,
};

describe('GraphNodeFrame', () => {
  it('renders a <rect> element', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} />
      </svg>
    );
    expect(container.querySelector('rect')).not.toBeNull();
  });

  it('rect has correct width and height', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} width={200} height={100} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('width')).toBe('200');
    expect(rect?.getAttribute('height')).toBe('100');
  });

  it('rect has correct rx/ry from radius', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} radius={12} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('rx')).toBe('12');
    expect(rect?.getAttribute('ry')).toBe('12');
  });

  it('rect has correct stroke from borderStroke', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} borderStroke="#ff0000" />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke')).toBe('#ff0000');
  });

  it('rect has correct strokeOpacity from borderOpacity', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} borderOpacity={0.5} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke-opacity')).toBe('0.5');
  });

  it('rect has correct strokeWidth from borderWidth', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} borderWidth={4} />
      </svg>
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('stroke-width')).toBe('4');
  });

  it('does not render focus rect when isFocused is false', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} isFocused={false} />
      </svg>
    );
    expect(container.querySelectorAll('rect')).toHaveLength(1);
  });

  it('renders focus rect when isFocused is true', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} isFocused />
      </svg>
    );
    expect(container.querySelectorAll('rect')).toHaveLength(2);
  });

  it('focus rect has strokeDasharray', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} isFocused />
      </svg>
    );
    const rects = container.querySelectorAll('rect');
    const focusRect = rects[1];
    expect(focusRect?.getAttribute('stroke-dasharray')).toBeTruthy();
  });

  it('focus rect uses selectionColor as stroke', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} isFocused selectionColor="#abc123" />
      </svg>
    );
    const rects = container.querySelectorAll('rect');
    const focusRect = rects[1];
    expect(focusRect?.getAttribute('stroke')).toBe('#abc123');
  });

  it('focus rect is wider/taller than the main rect', () => {
    const { container } = render(
      <svg>
        <GraphNodeFrame {...defaultProps} isFocused width={180} height={72} />
      </svg>
    );
    const rects = container.querySelectorAll('rect');
    const mainRect = rects[0]!;
    const focusRect = rects[1]!;
    expect(Number(focusRect.getAttribute('width'))).toBeGreaterThan(
      Number(mainRect.getAttribute('width'))
    );
    expect(Number(focusRect.getAttribute('height'))).toBeGreaterThan(
      Number(mainRect.getAttribute('height'))
    );
  });
});
