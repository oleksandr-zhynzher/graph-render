import type { SquashNodeRenderMode } from '@graph-render/types';
import React from 'react';

import { InvalidSquashNode } from './InvalidSquashNode';

interface SquashNodeErrorBoundaryProps {
  readonly nodeId: string;
  readonly renderMode: SquashNodeRenderMode;
  readonly width: number;
  readonly height: number;
  readonly onRenderError?: ((nodeId: string, error: Error) => void) | undefined;
  readonly children: React.ReactNode;
}

interface SquashNodeErrorBoundaryState {
  readonly error: Error | null;
}

export class SquashNodeErrorBoundary extends React.Component<
  SquashNodeErrorBoundaryProps,
  SquashNodeErrorBoundaryState
> {
  override state: SquashNodeErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SquashNodeErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error): void {
    this.props.onRenderError?.(this.props.nodeId, error);
  }

  override componentDidUpdate(prevProps: SquashNodeErrorBoundaryProps): void {
    if (
      this.state.error &&
      (prevProps.nodeId !== this.props.nodeId || prevProps.children !== this.props.children)
    ) {
      this.setState({ error: null });
    }
  }

  override render(): React.ReactNode {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <InvalidSquashNode
        width={this.props.width}
        height={this.props.height}
        renderMode={this.props.renderMode}
        nodeId={this.props.nodeId}
      />
    );
  }
}
