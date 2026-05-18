import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GraphMarkerDefs } from '../GraphMarkerDefs';

const defaultProps = {
  arrowMarkerId: 'arrow',
  edgeColor: '#334155',
  hoverArrowMarkerId: 'hover-arrow',
  hoverEdgeColor: '#4da3ff',
  hoverIncomingArrowMarkerId: 'hover-incoming',
  hoverNodeOutColor: '#ff5b5b',
  selectionArrowMarkerId: 'selection-arrow',
  selectionEdgeColor: '#f59e0b',
};

describe('GraphMarkerDefs', () => {
  it('renders a <defs> element', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} />
      </svg>
    );
    expect(container.querySelector('defs')).not.toBeNull();
  });

  it('renders exactly 4 marker elements', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} />
      </svg>
    );
    expect(container.querySelectorAll('marker')).toHaveLength(4);
  });

  it('uses provided arrowMarkerId', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} arrowMarkerId="my-arrow" />
      </svg>
    );
    expect(container.querySelector('#my-arrow')).not.toBeNull();
  });

  it('uses provided hoverArrowMarkerId', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} hoverArrowMarkerId="my-hover" />
      </svg>
    );
    expect(container.querySelector('#my-hover')).not.toBeNull();
  });

  it('uses provided hoverIncomingArrowMarkerId', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} hoverIncomingArrowMarkerId="incoming" />
      </svg>
    );
    expect(container.querySelector('#incoming')).not.toBeNull();
  });

  it('uses provided selectionArrowMarkerId', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} selectionArrowMarkerId="selection" />
      </svg>
    );
    expect(container.querySelector('#selection')).not.toBeNull();
  });

  it('fills each marker path with the correct color', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} edgeColor="#aabbcc" />
      </svg>
    );
    const paths = container.querySelectorAll('marker path');
    const colors = [...paths].map((p) => p.getAttribute('fill'));
    expect(colors).toContain('#aabbcc');
  });

  it('renders arrow paths inside each marker', () => {
    const { container } = render(
      <svg>
        <GraphMarkerDefs {...defaultProps} />
      </svg>
    );
    const paths = container.querySelectorAll('marker path');
    expect(paths.length).toBe(4);
  });
});
