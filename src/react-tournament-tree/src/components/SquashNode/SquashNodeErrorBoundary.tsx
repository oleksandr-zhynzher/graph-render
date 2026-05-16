import React from 'react';
import type { SquashNodeRenderMode } from '@graph-render/types';
import { InvalidSquashNode } from './InvalidSquashNode';

type SquashNodeErrorBoundaryProps = {
  nodeId: string;
  renderMode: SquashNodeRenderMode;
  width: number;
  height: number;
  onRenderError?: (nodeId: string, error: Error) => void;
  children: React.ReactNode;
};

type SquashNodeErrorBoundaryState = {
  error: Error | null;
};

export class SquashNodeErrorBoundary extends React.Component<
  SquashNodeErrorBoundaryProps,
  SquashNodeErrorBoundaryState
> {
  state: SquashNodeErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): SquashNodeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error): void {
    this.props.onRenderError?.(this.props.nodeId, error);
  }

  componentDidUpdate(prevProps: SquashNodeErrorBoundaryProps): void {
    if (
      this.state.error &&
      (prevProps.nodeId !== this.props.nodeId || prevProps.children !== this.props.children)
    ) {
      this.setState({ error: null });
    }
  }

  render(): React.ReactNode {
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
